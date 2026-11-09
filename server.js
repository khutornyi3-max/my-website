"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const { promisify } = require("node:util");

const scrypt = promisify(crypto.scrypt);
const rootDirectory = __dirname;
const dataDirectory = path.resolve(process.env.DATA_DIR || path.join(rootDirectory, "data"));
const uploadDirectory = path.resolve(process.env.UPLOAD_DIR || path.join(rootDirectory, "uploads"));
const productFile = path.join(dataDirectory, "soap-products.json");
const sessionCookieName = "beauty_owner_session";
const sessionLifetimeMs = 8 * 60 * 60 * 1000;
const maxJsonBodyBytes = 6 * 1024 * 1024;
const maxImageBytes = 4 * 1024 * 1024;
const maxLoginAttempts = 5;
const loginWindowMs = 15 * 60 * 1000;
const soapProductCategories = new Set([
    "figures",
    "gift-sets",
    "flower-wedding",
    "flower-birthday",
    "flower-valentines",
    "flower-march",
    "flower-school",
    "flower-any-occasion",
    "candle-beeswax-sheet",
    "candle-wax",
    "candle-gift-sets",
    "flower-box-baskets",
    "flower-box-planters",
    "flower-box-bags",
    "card-wedding",
    "card-anniversary",
    "card-envelopes",
    "ribbon-satin",
    "ribbon-lace",
    "ribbon-chiffon",
    "gift-bag-paper",
    "gift-bag-kraft",
    "gift-bag-foil",
    "cosmetics-her",
    "cosmetics-him",
    "household-kitchen",
    "household-bathroom",
    "household-home"
]);
const sessions = new Map();
const loginAttempts = new Map();
const trustedProxyAddresses = new Set(
    (process.env.TRUSTED_PROXY_IPS || "").split(",").map((address) => address.trim()).filter(Boolean)
);
const isProduction = process.env.NODE_ENV === "production";
const ownerUsername = process.env.OWNER_USERNAME || "owner";
const ownerPassword = process.env.OWNER_PASSWORD;
const passwordSalt = crypto.randomBytes(16);
let ownerPasswordHash;

if (!ownerPassword || ownerPassword.length < 12) {
    throw new Error("Set OWNER_PASSWORD to a secret with at least 12 characters before starting the server.");
}
if (ownerUsername.length > 80) {
    throw new Error("OWNER_USERNAME must be 80 characters or fewer.");
}

if (isProduction && !process.env.PUBLIC_ORIGIN) {
    throw new Error("Set PUBLIC_ORIGIN to the public HTTPS origin before starting in production.");
}

if (process.env.PUBLIC_ORIGIN) {
    const publicUrl = new URL(process.env.PUBLIC_ORIGIN);
    if (!["http:", "https:"].includes(publicUrl.protocol) || publicUrl.origin !== process.env.PUBLIC_ORIGIN) {
        throw new Error("PUBLIC_ORIGIN must contain only the exact site origin, such as https://shop.example.com.");
    }
    if (isProduction && publicUrl.protocol !== "https:") {
        throw new Error("PUBLIC_ORIGIN must use HTTPS in production.");
    }
}

function sendJson(response, statusCode, payload, extraHeaders = {}) {
    response.writeHead(statusCode, {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        ...extraHeaders
    });
    response.end(JSON.stringify(payload));
}

function setSecurityHeaders(response) {
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; " +
        "connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
    );
}

function getRequestOrigin(request) {
    const origin = request.headers.origin;
    if (typeof origin !== "string") {
        return null;
    }
    try {
        return new URL(origin).origin;
    } catch {
        return null;
    }
}

function isSameOriginRequest(request) {
    const origin = getRequestOrigin(request);
    if (!origin) {
        return false;
    }

    const expectedOrigin = process.env.PUBLIC_ORIGIN ||
        `${request.socket.encrypted ? "https" : "http"}://${request.headers.host || ""}`;
    return origin === expectedOrigin &&
        (!request.headers["sec-fetch-site"] || request.headers["sec-fetch-site"] === "same-origin");
}

async function readJsonBody(request, maxBytes = maxJsonBodyBytes) {
    if (!request.headers["content-type"]?.toLowerCase().startsWith("application/json")) {
        throw Object.assign(new Error("Content-Type must be application/json."), { statusCode: 415 });
    }

    const chunks = [];
    let receivedBytes = 0;
    for await (const chunk of request) {
        receivedBytes += chunk.length;
        if (receivedBytes > maxBytes) {
            request.resume();
            throw Object.assign(new Error("Request body is too large."), { statusCode: 413 });
        }
        chunks.push(chunk);
    }

    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
        throw Object.assign(new Error("Request body must contain valid JSON."), { statusCode: 400 });
    }
}

function getSessionToken(request) {
    const cookies = request.headers.cookie || "";
    for (const cookie of cookies.split(";")) {
        const separator = cookie.indexOf("=");
        if (separator < 0 || cookie.slice(0, separator).trim() !== sessionCookieName) {
            continue;
        }
        return cookie.slice(separator + 1).trim();
    }
    return "";
}

function getOwnerSession(request) {
    const token = getSessionToken(request);
    const session = sessions.get(token);
    if (!session) {
        return null;
    }
    if (session.expiresAt <= Date.now()) {
        sessions.delete(token);
        return null;
    }
    return session;
}

function requireOwner(request, response) {
    const session = getOwnerSession(request);
    if (!session) {
        sendJson(response, 401, { error: "Увійдіть як власник магазину." });
        return null;
    }
    if (!isSameOriginRequest(request) && request.method !== "GET") {
        sendJson(response, 403, { error: "Недійсний запит із зовнішнього джерела." });
        return null;
    }
    if (request.headers["x-csrf-token"] !== session.csrfToken) {
        sendJson(response, 403, { error: "Перевірка безпеки не пройдена. Оновіть сторінку та увійдіть знову." });
        return null;
    }
    return session;
}

function readProducts() {
    try {
        const products = JSON.parse(fs.readFileSync(productFile, "utf8"));
        if (!Array.isArray(products)) {
            throw new Error("Product data must be a JSON array.");
        }
        return products;
    } catch (error) {
        if (error.code === "ENOENT") {
            return [];
        }
        throw error;
    }
}

function writeProducts(products) {
    fs.mkdirSync(dataDirectory, { recursive: true });
    const temporaryFile = path.join(dataDirectory, `soap-products-${crypto.randomUUID()}.tmp`);
    fs.writeFileSync(temporaryFile, JSON.stringify(products), { mode: 0o600 });
    fs.renameSync(temporaryFile, productFile);
}

function getImageBuffer(dataUrl) {
    if (typeof dataUrl !== "string") {
        throw Object.assign(new Error("Choose a JPEG product image."), { statusCode: 400 });
    }
    const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
    if (!match) {
        throw Object.assign(new Error("Product images must be valid JPEG files."), { statusCode: 400 });
    }
    const image = Buffer.from(match[1], "base64");
    if (
        image.length === 0 ||
        image.length > maxImageBytes ||
        image[0] !== 0xff ||
        image[1] !== 0xd8 ||
        image[2] !== 0xff
    ) {
        throw Object.assign(new Error("The JPEG image is invalid or exceeds the 4 MB limit."), { statusCode: 400 });
    }
    return image;
}

function publicProduct(product) {
    return {
        id: product.id,
        category: product.category,
        name: product.name,
        price: product.price,
        image: `/uploads/${product.id}.jpg`
    };
}

function getClientAddress(request) {
    const remoteAddress = request.socket.remoteAddress || "unknown";
    if (!trustedProxyAddresses.has(remoteAddress)) {
        return remoteAddress;
    }

    const forwardedAddress = request.headers["x-real-ip"];
    return typeof forwardedAddress === "string" && net.isIP(forwardedAddress)
        ? forwardedAddress
        : remoteAddress;
}

function checkLoginRateLimit(request) {
    const address = getClientAddress(request);
    const currentTime = Date.now();
    const attempts = (loginAttempts.get(address) || []).filter(
        (timestamp) => timestamp > currentTime - loginWindowMs
    );
    loginAttempts.set(address, attempts);
    return attempts.length < maxLoginAttempts;
}

function recordLoginAttempt(request) {
    const address = getClientAddress(request);
    const attempts = (loginAttempts.get(address) || []).filter(
        (timestamp) => timestamp > Date.now() - loginWindowMs
    );
    attempts.push(Date.now());
    loginAttempts.set(address, attempts);
}

function verifyCsrf(request, session) {
    return request.headers["x-csrf-token"] === session.csrfToken;
}

async function handleLogin(request, response) {
    if (!isSameOriginRequest(request)) {
        sendJson(response, 403, { error: "Недійсний запит із зовнішнього джерела." });
        return;
    }
    if (!checkLoginRateLimit(request)) {
        sendJson(response, 429, { error: "Забагато спроб входу. Зачекайте 15 хвилин і спробуйте знову." });
        return;
    }

    recordLoginAttempt(request);
    const body = await readJsonBody(request, 8 * 1024);
    const username = body && typeof body.username === "string" ? body.username : "";
    const password = body && typeof body.password === "string" ? body.password : "";
    if (username.length > 80 || password.length > 200) {
        sendJson(response, 400, { error: "Логін або пароль має недопустиму довжину." });
        return;
    }
    const submittedHash = await scrypt(password, passwordSalt, 64);
    const usernameMatches = crypto.timingSafeEqual(
        crypto.createHash("sha256").update(username).digest(),
        crypto.createHash("sha256").update(ownerUsername).digest()
    );
    const passwordMatches = crypto.timingSafeEqual(submittedHash, ownerPasswordHash);

    if (!usernameMatches || !passwordMatches) {
        sendJson(response, 401, { error: "Неправильний логін або пароль." });
        return;
    }

    loginAttempts.delete(getClientAddress(request));
    const token = crypto.randomBytes(32).toString("base64url");
    const csrfToken = crypto.randomBytes(32).toString("base64url");
    sessions.set(token, { csrfToken, expiresAt: Date.now() + sessionLifetimeMs });
    sendJson(response, 200, { authenticated: true, csrfToken }, {
        "Set-Cookie": `${sessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${isProduction ? "; Secure" : ""}`
    });
}

async function handleCreateProduct(request, response) {
    const session = requireOwner(request, response);
    if (!session) {
        return;
    }

    const body = await readJsonBody(request);
    const name = body && typeof body.name === "string" ? body.name.trim() : "";
    const category = body && body.category;
    const price = body && body.price;
    if (
        !name ||
        name.length > 80 ||
        !soapProductCategories.has(category) ||
        !Number.isFinite(price) ||
        price <= 0 ||
        price > 1000000 ||
        Math.round(price * 100) !== price * 100
    ) {
        sendJson(response, 400, { error: "Перевірте назву, категорію та ціну товару." });
        return;
    }

    const image = getImageBuffer(body.image);
    const products = readProducts();
    const requestedId = typeof body.id === "string" ? body.id : "";
    const id = requestedId || crypto.randomUUID();
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(id) || products.some((product) => product.id === id)) {
        sendJson(response, 409, { error: "Товар із таким ідентифікатором уже існує." });
        return;
    }

    fs.mkdirSync(uploadDirectory, { recursive: true });
    const imagePath = path.join(uploadDirectory, `${id}.jpg`);
    fs.writeFileSync(imagePath, image, { flag: "wx", mode: 0o600 });
    const product = { id, category, name, price, imageFile: `${id}.jpg` };
    try {
        writeProducts([...products, product]);
    } catch (error) {
        fs.unlinkSync(imagePath);
        throw error;
    }
    sendJson(response, 201, { product: publicProduct(product) });
}

async function handleDeleteProduct(request, response, productId) {
    const session = requireOwner(request, response);
    if (!session) {
        return;
    }

    if (!/^[A-Za-z0-9_-]{1,80}$/.test(productId)) {
        sendJson(response, 400, { error: "Некоректний ідентифікатор товару." });
        return;
    }
    const products = readProducts();
    const product = products.find((item) => item.id === productId);
    if (!product) {
        sendJson(response, 404, { error: "Товар не знайдено." });
        return;
    }

    const updatedProducts = products.filter((item) => item.id !== productId);
    writeProducts(updatedProducts);
    try {
        fs.unlinkSync(path.join(uploadDirectory, `${productId}.jpg`));
    } catch (error) {
        if (error.code !== "ENOENT") {
            writeProducts(products);
            throw error;
        }
    }
    sendJson(response, 200, { deleted: true });
}

function serveStaticFile(request, response, pathname) {
    let filePath;
    if (pathname === "/") {
        filePath = path.join(rootDirectory, "index.html");
    } else if (["/index.html", "/style.css", "/script.js"].includes(pathname)) {
        filePath = path.join(rootDirectory, pathname.slice(1));
    } else if (/^\/images\/[A-Za-z0-9._-]+$/.test(pathname)) {
        filePath = path.join(rootDirectory, pathname.slice(1));
    } else {
        const uploadMatch = /^\/uploads\/([A-Za-z0-9_-]{1,80}\.jpg)$/.exec(pathname);
        if (!uploadMatch) {
            sendJson(response, 404, { error: "Ресурс не знайдено." });
            return;
        }
        filePath = path.join(uploadDirectory, uploadMatch[1]);
    }

    let file;
    try {
        file = fs.readFileSync(filePath);
    } catch (error) {
        if (error.code === "ENOENT") {
            sendJson(response, 404, { error: "Ресурс не знайдено." });
            return;
        }
        throw error;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentTypes = {
        ".css": "text/css; charset=utf-8",
        ".html": "text/html; charset=utf-8",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".js": "text/javascript; charset=utf-8",
        ".png": "image/png",
        ".webp": "image/webp"
    };
    response.writeHead(200, {
        "Cache-Control": extension === ".html" || extension === ".js" || extension === ".css"
            ? "no-cache"
            : "public, max-age=86400",
        "Content-Length": file.length,
        "Content-Type": contentTypes[extension] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff"
    });
    response.end(file);
}

async function handleRequest(request, response) {
    setSecurityHeaders(response);
    const requestUrl = new URL(request.url, "http://localhost");
    const pathname = decodeURIComponent(requestUrl.pathname);

    if (pathname.startsWith("/api/")) {
        if (request.method === "GET" && pathname === "/api/auth/status") {
            const session = getOwnerSession(request);
            sendJson(response, 200, {
                authenticated: Boolean(session),
                csrfToken: session?.csrfToken || ""
            });
            return;
        }
        if (request.method === "GET" && pathname === "/api/products") {
            sendJson(response, 200, { products: readProducts().map(publicProduct) });
            return;
        }
        if (request.method === "POST" && pathname === "/api/auth/login") {
            await handleLogin(request, response);
            return;
        }
        if (request.method === "POST" && pathname === "/api/auth/logout") {
            const session = getOwnerSession(request);
            if (!session || !isSameOriginRequest(request) || !verifyCsrf(request, session)) {
                sendJson(response, session ? 403 : 401, { error: "Сеанс завершився або перевірка безпеки не пройдена." });
                return;
            }
            sessions.delete(getSessionToken(request));
            sendJson(response, 200, { authenticated: false }, {
                "Set-Cookie": `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${isProduction ? "; Secure" : ""}`
            });
            return;
        }
        if (request.method === "POST" && pathname === "/api/products") {
            await handleCreateProduct(request, response);
            return;
        }
        if (request.method === "DELETE" && pathname.startsWith("/api/products/")) {
            await handleDeleteProduct(request, response, pathname.slice("/api/products/".length));
            return;
        }
        sendJson(response, 404, { error: "API-маршрут не знайдено." });
        return;
    }

    if (request.method !== "GET") {
        sendJson(response, 405, { error: "Метод запиту не підтримується." }, { Allow: "GET" });
        return;
    }
    serveStaticFile(request, response, pathname);
}

async function startServer() {
    ownerPasswordHash = await scrypt(ownerPassword, passwordSalt, 64);
    fs.mkdirSync(dataDirectory, { recursive: true });
    fs.mkdirSync(uploadDirectory, { recursive: true });
    const port = Number(process.env.PORT || 3000);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("PORT must be a valid TCP port.");
    }

    const server = http.createServer((request, response) => {
        handleRequest(request, response).catch((error) => {
            console.error("Request failed:", error);
            if (!response.headersSent) {
                sendJson(response, error.statusCode || 500, {
                    error: error.statusCode ? error.message : "Внутрішня помилка сервера."
                });
            } else {
                response.destroy(error);
            }
        });
    });
    server.listen(port, process.env.HOST || "127.0.0.1", () => {
        console.log(`Beauty for every day is listening on port ${port}.`);
    });
}

startServer().catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
});
