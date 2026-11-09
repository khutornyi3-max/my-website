const menu = document.getElementById("mobile-menu");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navbar");
const searchForm = document.getElementById("product-search-form");
const searchInput = document.getElementById("catalog-search");
const searchStatus = document.getElementById("search-status");
const searchTriggers = [...document.querySelectorAll("[data-search-toggle]")];
const searchCards = [...document.querySelectorAll(".catalog-card")];
const catalogHeading = document.querySelector(".catalog-heading");
const catalogGrid = document.querySelector(".catalog-grid");
const soapSection = document.getElementById("soap-section");
const flowerSoapSection = document.getElementById("flower-soap-section");
const candleSection = document.getElementById("candle-section");
const flowerBoxSection = document.getElementById("flower-box-section");
const cardSection = document.getElementById("card-section");
const ribbonSection = document.getElementById("ribbon-section");
const giftBagSection = document.getElementById("gift-bag-section");
const cosmeticsSection = document.getElementById("cosmetics-section");
const householdSection = document.getElementById("household-section");
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
const accountSection = document.getElementById("account");
const accountTriggers = [...document.querySelectorAll("[data-account-toggle]")];
const cartSection = document.getElementById("cart");
const cartTriggers = [...document.querySelectorAll("[data-cart-toggle]")];
const reviewsSection = document.getElementById("reviews");
const reviewsTriggers = [...document.querySelectorAll("[data-reviews-toggle]")];

function setSearchOpen(isOpen) {
    searchForm.hidden = !isOpen;
    searchTriggers.forEach((trigger) => {
        trigger.setAttribute("aria-expanded", String(isOpen));
    });

    if (isOpen) {
        setMenuOpen(false);
        searchInput.focus();
    }
}

function closeSearch() {
    setSearchOpen(false);
    const visibleTrigger = searchTriggers.find((trigger) => trigger.getClientRects().length > 0);
    (visibleTrigger || menuToggle).focus();
}

function setAccountOpen(isOpen) {
    accountSection.hidden = !isOpen;
    navigation.classList.toggle("account-open", isOpen);
    accountTriggers.forEach((trigger) => {
        trigger.setAttribute("aria-expanded", String(isOpen));
    });

    if (isOpen) {
        cartSection.hidden = true;
        reviewsSection.hidden = true;
        navigation.classList.remove("cart-open");
        navigation.classList.remove("reviews-open");
        cartTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
        reviewsTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
        setSearchOpen(false);
        setMenuOpen(false);
        accountSection.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start"
        });
        document.getElementById("account-title").focus({ preventScroll: true });
    }
}

function setCartOpen(isOpen) {
    cartSection.hidden = !isOpen;
    navigation.classList.toggle("cart-open", isOpen);
    cartTriggers.forEach((trigger) => {
        trigger.setAttribute("aria-expanded", String(isOpen));
    });

    if (isOpen) {
        accountSection.hidden = true;
        reviewsSection.hidden = true;
        navigation.classList.remove("account-open");
        navigation.classList.remove("reviews-open");
        accountTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
        reviewsTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
        setSearchOpen(false);
        setMenuOpen(false);
        cartSection.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start"
        });
        document.getElementById("cart-title").focus({ preventScroll: true });
    }
}

function setReviewsOpen(isOpen) {
    reviewsSection.hidden = !isOpen;
    navigation.classList.toggle("reviews-open", isOpen);
    reviewsTriggers.forEach((trigger) => {
        trigger.setAttribute("aria-expanded", String(isOpen));
    });

    if (isOpen) {
        accountSection.hidden = true;
        cartSection.hidden = true;
        navigation.classList.remove("account-open", "cart-open");
        accountTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
        cartTriggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
        setSearchOpen(false);
        setMenuOpen(false);
        reviewsSection.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start"
        });
        document.getElementById("reviews-title").focus({ preventScroll: true });
    }
}

function filterCatalog(query) {
    const normalizedQuery = query.trim().toLocaleLowerCase("uk-UA");
    let matchingCount = 0;

    searchCards.forEach((card) => {
        const matches = card.textContent.toLocaleLowerCase("uk-UA").includes(normalizedQuery);
        card.hidden = normalizedQuery.length > 0 && !matches;
        matchingCount += Number(!card.hidden);
    });

    searchStatus.textContent = normalizedQuery
        ? matchingCount > 0
            ? `Знайдено категорій: ${matchingCount}`
            : "Нічого не знайдено. Спробуйте інший запит."
        : `У каталозі ${matchingCount} категорій`;

    return matchingCount;
}

searchTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
        setSearchOpen(searchForm.hidden);
    });
});

accountTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
        const isOpen = accountSection.hidden;
        setAccountOpen(isOpen);

        if (trigger.classList.contains("mobile-account-toggle")) {
            setMenuOpen(false);
            if (!isOpen) {
                menuToggle.focus();
            }
        }
    });
});

cartTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
        const isOpen = cartSection.hidden;
        setCartOpen(isOpen);

        if (trigger.classList.contains("mobile-cart-toggle")) {
            setMenuOpen(false);
            if (!isOpen) {
                menuToggle.focus();
            }
        }
    });
});

reviewsTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
        const isOpen = reviewsSection.hidden;
        setReviewsOpen(isOpen);

        if (trigger.classList.contains("mobile-reviews-toggle")) {
            setMenuOpen(false);
            if (!isOpen) {
                menuToggle.focus();
            }
        }
    });
});

searchInput.addEventListener("input", () => {
    filterCatalog(searchInput.value);
});

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const matchingCount = filterCatalog(searchInput.value);

    if (matchingCount > 0) {
        setSearchOpen(false);
        const catalog = document.getElementById("catalog");
        catalog.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start"
        });
        document.getElementById("catalog-title").focus({ preventScroll: true });
    } else {
        searchInput.focus();
    }
});

document.querySelector(".nav-search-clear").addEventListener("click", () => {
    searchInput.value = "";
    filterCatalog("");
    searchInput.focus();
});

document.querySelector(".nav-search-close").addEventListener("click", closeSearch);

const soapProductStorageKey = "beauty-for-every-day-soap-products";
const soapProductForms = [...document.querySelectorAll(".soap-product-form")];
const soapStorageNote = document.querySelector(".soap-storage-note");
const ownerLoginForm = document.getElementById("owner-login-form");
const ownerLoginToggle = document.querySelector("[data-owner-login-toggle]");
const ownerLogoutButton = document.querySelector("[data-owner-logout]");
const ownerLoginMessage = document.getElementById("owner-login-message");
let soapProducts = [];
let ownerCsrfToken = "";
let isStoreOwner = false;

async function soapApiRequest(path, { method = "GET", body, csrf = false } = {}) {
    const headers = { Accept: "application/json" };
    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }
    if (csrf) {
        headers["X-CSRF-Token"] = ownerCsrfToken;
    }

    const response = await fetch(path, {
        method,
        headers,
        credentials: "same-origin",
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    let result;
    try {
        result = await response.json();
    } catch {
        throw new Error("Сервер повернув некоректну відповідь.");
    }
    if (!response.ok) {
        if (response.status === 401 && isStoreOwner) {
            ownerCsrfToken = "";
            setStoreOwner(false);
        }
        throw new Error(result.error || `Запит не виконано (${response.status}).`);
    }
    return result;
}

function setStoreOwner(isOwner) {
    isStoreOwner = isOwner;
    ownerLoginToggle.hidden = isOwner;
    ownerLogoutButton.hidden = !isOwner;
    ownerLoginForm.hidden = isOwner || ownerLoginForm.hidden;
    ownerLoginToggle.setAttribute("aria-expanded", String(!ownerLoginForm.hidden));
    soapProductForms.forEach((form) => {
        form.hidden = !isOwner;
    });
    renderSoapProducts();
}

async function loadServerSoapProducts() {
    const result = await soapApiRequest("/api/products");
    if (!Array.isArray(result.products)) {
        throw new Error("Сервер повернув список товарів у неправильному форматі.");
    }
    soapProducts = result.products;
    renderSoapProducts();
}

async function migrateLegacySoapProducts() {
    let savedProducts;
    try {
        savedProducts = JSON.parse(localStorage.getItem(soapProductStorageKey) || "[]");
    } catch (error) {
        throw new Error(`Не вдалося прочитати попередні товари з цього браузера: ${error.message}`);
    }
    if (!Array.isArray(savedProducts) || savedProducts.length === 0) {
        return 0;
    }

    const existingIds = new Set(soapProducts.map((product) => product.id));
    let migratedCount = 0;
    for (const product of savedProducts) {
        if (
            !product ||
            typeof product.id !== "string" ||
            typeof product.name !== "string" ||
            !Number.isFinite(product.price) ||
            !soapProductCategories.has(product.category) ||
            typeof product.image !== "string" ||
            !product.image.startsWith("data:image/jpeg;base64,") ||
            existingIds.has(product.id)
        ) {
            continue;
        }

        await soapApiRequest("/api/products", {
            method: "POST",
            body: product,
            csrf: true
        });
        existingIds.add(product.id);
        migratedCount += 1;
    }

    try {
        localStorage.removeItem(soapProductStorageKey);
    } catch (error) {
        throw new Error(`Товари перенесені, але не вдалося очистити старі дані браузера: ${error.message}`);
    }
    return migratedCount;
}

function renderSoapProducts() {
    document.querySelectorAll("[data-soap-products]").forEach((list) => {
        const categoryProducts = soapProducts.filter((product) => product.category === list.dataset.soapProducts);
        list.replaceChildren();

        if (categoryProducts.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "soap-products-empty";
            emptyMessage.textContent = "Товарів поки немає. Додайте перший товар у цю категорію.";
            list.append(emptyMessage);
            return;
        }

        categoryProducts.forEach((product) => {
            const card = document.createElement("article");
            card.className = "soap-product-card";

            const image = document.createElement("img");
            image.src = product.image;
            image.alt = product.name;
            image.loading = "lazy";

            const content = document.createElement("div");
            content.className = "soap-product-card-content";

            const name = document.createElement("h5");
            name.textContent = product.name;

            const price = document.createElement("p");
            price.className = "soap-product-price";
            price.textContent = formatPrice(product.price);

            const addButton = document.createElement("button");
            addButton.className = "form-button";
            addButton.type = "button";
            addButton.dataset.addSoapToCart = product.id;
            addButton.textContent = "Додати в кошик";

            content.append(name, price, addButton);
            if (isStoreOwner) {
                const deleteButton = document.createElement("button");
                deleteButton.className = "soap-product-delete";
                deleteButton.type = "button";
                deleteButton.dataset.deleteSoapProduct = product.id;
                deleteButton.setAttribute("aria-label", `Видалити товар: ${product.name}`);
                deleteButton.textContent = "Видалити товар";
                content.append(deleteButton);
            }
            card.append(image, content);
            list.append(card);
        });
    });
}

async function initializeSoapStore() {
    try {
        const authStatus = await soapApiRequest("/api/auth/status");
        ownerCsrfToken = authStatus.csrfToken || "";
        setStoreOwner(Boolean(authStatus.authenticated));
        await loadServerSoapProducts();

        if (isStoreOwner) {
            const migratedCount = await migrateLegacySoapProducts();
            if (migratedCount > 0) {
                await loadServerSoapProducts();
                soapStorageNote.textContent = `Перенесено товарів зі старого каталогу: ${migratedCount}.`;
            }
        }
    } catch (error) {
        soapStorageNote.textContent =
            `Не вдалося під’єднатися до сервера каталогу: ${error.message} Запустіть сайт через сервер Node.js.`;
    }
}

function resizeProductImage(file) {
    return new Promise((resolve, reject) => {
        const imageUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(imageUrl);
            const maxDimension = 900;
            const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(image.width * scale));
            canvas.height = Math.max(1, Math.round(image.height * scale));
            const context = canvas.getContext("2d");

            if (!context) {
                reject(new Error("Браузер не зміг обробити фото."));
                return;
            }

            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        image.onerror = () => {
            URL.revokeObjectURL(imageUrl);
            reject(new Error("Не вдалося прочитати вибране фото."));
        };
        image.src = imageUrl;
    });
}

function openCatalogProductSection(section, trigger) {
    catalogHeading.hidden = true;
    catalogGrid.hidden = true;
    soapSection.hidden = section !== soapSection;
    flowerSoapSection.hidden = section !== flowerSoapSection;
    candleSection.hidden = section !== candleSection;
    flowerBoxSection.hidden = section !== flowerBoxSection;
    cardSection.hidden = section !== cardSection;
    ribbonSection.hidden = section !== ribbonSection;
    giftBagSection.hidden = section !== giftBagSection;
    cosmeticsSection.hidden = section !== cosmeticsSection;
    householdSection.hidden = section !== householdSection;
    document.querySelectorAll(
        "[data-open-soap-section], [data-open-flower-section], [data-open-candle-section], " +
        "[data-open-flower-box-section], [data-open-card-section], [data-open-ribbon-section], " +
        "[data-open-gift-bag-section], " +
        "[data-open-cosmetics-section], [data-open-household-section]"
    ).forEach((button) => button.setAttribute("aria-expanded", "false"));
    trigger.setAttribute("aria-expanded", "true");
    section.querySelector(".soap-section-heading h2, .soap-section-heading h3").focus({ preventScroll: true });
    section.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
    });
}

function closeCatalogProductSections() {
    soapSection.hidden = true;
    flowerSoapSection.hidden = true;
    candleSection.hidden = true;
    flowerBoxSection.hidden = true;
    cardSection.hidden = true;
    ribbonSection.hidden = true;
    giftBagSection.hidden = true;
    cosmeticsSection.hidden = true;
    householdSection.hidden = true;
    catalogHeading.hidden = false;
    catalogGrid.hidden = false;
    document.querySelector("[data-open-soap-section]").setAttribute("aria-expanded", "false");
    document.querySelector("[data-open-flower-section]").setAttribute("aria-expanded", "false");
    document.querySelector("[data-open-candle-section]").setAttribute("aria-expanded", "false");
    document.querySelector("[data-open-flower-box-section]").setAttribute("aria-expanded", "false");
    document.querySelector("[data-open-card-section]").setAttribute("aria-expanded", "false");
    document.querySelector("[data-open-ribbon-section]").setAttribute("aria-expanded", "false");
    document.querySelector("[data-open-gift-bag-section]").setAttribute("aria-expanded", "false");
    document.querySelector("[data-open-cosmetics-section]").setAttribute("aria-expanded", "false");
    document.querySelector("[data-open-household-section]").setAttribute("aria-expanded", "false");
    document.getElementById("catalog-title").focus({ preventScroll: true });
    document.getElementById("catalog").scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
    });
}

document.querySelector("[data-open-soap-section]").addEventListener("click", (event) => {
    openCatalogProductSection(soapSection, event.currentTarget);
});

document.querySelector("[data-open-flower-section]").addEventListener("click", (event) => {
    openCatalogProductSection(flowerSoapSection, event.currentTarget);
});

document.querySelector("[data-open-candle-section]").addEventListener("click", (event) => {
    openCatalogProductSection(candleSection, event.currentTarget);
});

document.querySelector("[data-open-flower-box-section]").addEventListener("click", (event) => {
    openCatalogProductSection(flowerBoxSection, event.currentTarget);
});

document.querySelector("[data-open-card-section]").addEventListener("click", (event) => {
    openCatalogProductSection(cardSection, event.currentTarget);
});

document.querySelector("[data-open-ribbon-section]").addEventListener("click", (event) => {
    openCatalogProductSection(ribbonSection, event.currentTarget);
});

document.querySelector("[data-open-gift-bag-section]").addEventListener("click", (event) => {
    openCatalogProductSection(giftBagSection, event.currentTarget);
});

document.querySelector("[data-open-cosmetics-section]").addEventListener("click", (event) => {
    openCatalogProductSection(cosmeticsSection, event.currentTarget);
});

document.querySelector("[data-open-household-section]").addEventListener("click", (event) => {
    openCatalogProductSection(householdSection, event.currentTarget);
});

document.querySelectorAll(
    "[data-close-soap-section], [data-close-flower-section], [data-close-candle-section], " +
    "[data-close-flower-box-section], [data-close-card-section], [data-close-ribbon-section], " +
    "[data-close-gift-bag-section], " +
    "[data-close-cosmetics-section], [data-close-household-section]"
).forEach((button) => {
    button.addEventListener("click", closeCatalogProductSections);
});

ownerLoginToggle.addEventListener("click", () => {
    ownerLoginForm.hidden = false;
    ownerLoginToggle.setAttribute("aria-expanded", "true");
    ownerLoginForm.querySelector("#owner-username").focus();
});

document.querySelector("[data-owner-login-cancel]").addEventListener("click", () => {
    ownerLoginForm.reset();
    ownerLoginMessage.textContent = "";
    ownerLoginForm.hidden = true;
    ownerLoginToggle.setAttribute("aria-expanded", "false");
    ownerLoginToggle.focus();
});

ownerLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = ownerLoginForm.querySelector('button[type="submit"]');
    const formData = new FormData(ownerLoginForm);
    submitButton.disabled = true;
    ownerLoginMessage.textContent = "Перевіряємо облікові дані…";

    try {
        const result = await soapApiRequest("/api/auth/login", {
            method: "POST",
            body: {
                username: formData.get("username"),
                password: formData.get("password")
            }
        });
        ownerCsrfToken = result.csrfToken;
        setStoreOwner(true);
        ownerLoginForm.reset();
        ownerLoginMessage.textContent = "";
        const migratedCount = await migrateLegacySoapProducts();
        await loadServerSoapProducts();
        soapStorageNote.textContent = migratedCount > 0
            ? `Вхід успішний. Перенесено товарів зі старого каталогу: ${migratedCount}.`
            : "Ви увійшли як власник магазину.";
    } catch (error) {
        ownerLoginMessage.textContent = error.message || "Не вдалося увійти.";
    } finally {
        submitButton.disabled = false;
    }
});

ownerLogoutButton.addEventListener("click", async () => {
    ownerLogoutButton.disabled = true;
    try {
        await soapApiRequest("/api/auth/logout", {
            method: "POST",
            csrf: true
        });
        ownerCsrfToken = "";
        ownerLoginForm.hidden = true;
        ownerLoginToggle.setAttribute("aria-expanded", "false");
        setStoreOwner(false);
        soapStorageNote.textContent = "Ви вийшли з режиму власника магазину.";
    } catch (error) {
        soapStorageNote.textContent = `Не вдалося завершити сеанс: ${error.message}`;
    } finally {
        ownerLogoutButton.disabled = false;
    }
});

soapProductForms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const message = form.querySelector(".form-message");
        const submitButton = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        const imageFile = formData.get("image");
        const name = String(formData.get("name")).trim();
        const price = Number(formData.get("price"));

        if (!(imageFile instanceof File) || imageFile.size === 0 || !imageFile.type.startsWith("image/")) {
            message.textContent = "Виберіть фото товару у форматі зображення.";
            return;
        }

        if (imageFile.size > 5 * 1024 * 1024) {
            message.textContent = "Фото завелике. Виберіть файл до 5 МБ.";
            return;
        }

        if (!name || !Number.isFinite(price) || price <= 0 || price > 1000000) {
            message.textContent = "Вкажіть назву товару та ціну від 0,01 до 1 000 000 грн.";
            return;
        }

        submitButton.disabled = true;
        message.textContent = "Обробляємо фото…";

        try {
            const product = {
                id: `soap-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                category: form.dataset.soapCategory,
                name,
                price,
                image: await resizeProductImage(imageFile)
            };
            await soapApiRequest("/api/products", {
                method: "POST",
                body: product,
                csrf: true
            });
            await loadServerSoapProducts();
            form.reset();
            message.textContent = "Товар додано до каталогу.";
        } catch (error) {
            message.textContent = error.message || "Не вдалося додати товар.";
        } finally {
            submitButton.disabled = false;
        }
    });
});

document.querySelector(".soap-section").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-add-soap-to-cart], [data-delete-soap-product]");
    if (!button) {
        return;
    }

    if (button.matches("[data-delete-soap-product]")) {
        const product = soapProducts.find((item) => item.id === button.dataset.deleteSoapProduct);
        if (!product || !window.confirm(`Видалити товар «${product.name}» із каталогу?`)) {
            return;
        }

        try {
            await soapApiRequest(`/api/products/${encodeURIComponent(product.id)}`, {
                method: "DELETE",
                csrf: true
            });
            const cartProductIndex = cartProducts.findIndex((item) => item.id === product.id);
            if (cartProductIndex >= 0) {
                cartProducts.splice(cartProductIndex, 1);
                renderCart();
            }
            await loadServerSoapProducts();
            soapStorageNote.textContent = `Товар «${product.name}» видалено з каталогу.`;
        } catch (error) {
            soapStorageNote.textContent = `Не вдалося видалити товар: ${error.message}`;
        }
        return;
    }

    const product = soapProducts.find((item) => item.id === button.dataset.addSoapToCart);
    if (!product) {
        soapStorageNote.textContent = "Не вдалося знайти товар. Оновіть сторінку та спробуйте ще раз.";
        return;
    }

    const existingCartProduct = cartProducts.find((item) => item.id === product.id);
    if (existingCartProduct) {
        existingCartProduct.quantity += 1;
    } else {
        cartProducts.push({ ...product, quantity: 1 });
    }

    renderCart();
    button.textContent = "Додано до кошика";
    window.setTimeout(() => {
        button.textContent = "Додати в кошик";
    }, 1800);
});

renderSoapProducts();
initializeSoapStore();

const backgroundPhotoSets = {
    navigation: [
        "images/soap-flower-basket.jpg",
        "images/handmade-header.jpg",
        "images/nav-soap.jpg",
        "images/nav-flowers.jpg",
        "images/nav-candles.jpg",
        "https://images.pexels.com/photos/30828535/pexels-photo-30828535.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/7764513/pexels-photo-7764513.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.unsplash.com/photo-1668127039852-0e7c8b3a1601?auto=format&fit=crop&w=1200&q=85"
    ],
    catalog: [
        "images/nav-soap.jpg",
        "images/soap-flower-basket.jpg",
        "images/nav-candles.jpg",
        "https://images.pexels.com/photos/30828535/pexels-photo-30828535.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/5040819/pexels-photo-5040819.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.unsplash.com/photo-1668127039852-0e7c8b3a1601?auto=format&fit=crop&w=1200&q=85",
        "https://images.pexels.com/photos/7764513/pexels-photo-7764513.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/16008945/pexels-photo-16008945.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/5217900/pexels-photo-5217900.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    account: [
        "images/soap-rose-background.jpg",
        "images/soap-flower-basket.jpg",
        "images/nav-soap.jpg",
        "images/nav-flowers.jpg",
        "https://images.pexels.com/photos/16008945/pexels-photo-16008945.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "images/nav-candles.jpg"
    ],
    cart: [
        "https://images.pexels.com/photos/30828535/pexels-photo-30828535.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/7764513/pexels-photo-7764513.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "images/soap-flower-basket.jpg",
        "https://images.unsplash.com/photo-1668127039852-0e7c8b3a1601?auto=format&fit=crop&w=1200&q=85",
        "images/nav-soap.jpg",
        "https://images.pexels.com/photos/16008945/pexels-photo-16008945.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "images/nav-candles.jpg"
    ]
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("[data-background-slideshow]").forEach((section) => {
    const photoSet = backgroundPhotoSets[section.dataset.backgroundSlideshow] || [];
    if (photoSet.length === 0) {
        return;
    }

    const slideshow = document.createElement("div");
    slideshow.className = "background-slideshow";
    slideshow.setAttribute("aria-hidden", "true");

    const frames = photoSet.map((photo, index) => {
        const frame = document.createElement("img");
        frame.src = photo;
        frame.alt = "";
        frame.loading = "lazy";
        frame.decoding = "async";
        frame.classList.toggle("is-active", index === 0);
        slideshow.append(frame);
        return frame;
    });

    section.prepend(slideshow);

    if (reducedMotion || frames.length < 2) {
        return;
    }

    let activeFrame = 0;
    let rotationTimer = null;

    const showNextFrame = () => {
        frames[activeFrame].classList.remove("is-active");
        activeFrame = (activeFrame + 1) % frames.length;
        frames[activeFrame].classList.add("is-active");
    };

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && rotationTimer === null) {
                    rotationTimer = window.setInterval(showNextFrame, 6500);
                } else if (!entry.isIntersecting && rotationTimer !== null) {
                    window.clearInterval(rotationTimer);
                    rotationTimer = null;
                }
            });
        }, { rootMargin: "160px" });

        observer.observe(section);
    } else {
        window.setInterval(showNextFrame, 6500);
    }
});

function setMenuOpen(isOpen) {
    menu.classList.toggle("show", isOpen);
    menu.hidden = !isOpen;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Закрити меню" : "Відкрити меню");
    menuToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
}

menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

const contactClock = document.querySelector(".contact-clock");

if (contactClock) {
    const clockReadout = contactClock.querySelector("[data-contact-clock]");

    const updateContactClock = () => {
        clockReadout.textContent = new Intl.DateTimeFormat("uk-UA", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }).format(new Date());
    };

    updateContactClock();
    window.setInterval(updateContactClock, 1000);
}

menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        setMenuOpen(false);
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !searchForm.hidden) {
        closeSearch();
    } else if (event.key === "Escape" && !accountSection.hidden) {
        setAccountOpen(false);
        const visibleTrigger = accountTriggers.find((trigger) => trigger.getClientRects().length > 0);
        (visibleTrigger || menuToggle).focus();
    } else if (event.key === "Escape" && !cartSection.hidden) {
        setCartOpen(false);
        const visibleTrigger = cartTriggers.find((trigger) => trigger.getClientRects().length > 0);
        (visibleTrigger || menuToggle).focus();
    } else if (event.key === "Escape" && !reviewsSection.hidden) {
        setReviewsOpen(false);
        const visibleTrigger = reviewsTriggers.find((trigger) => trigger.getClientRects().length > 0);
        (visibleTrigger || menuToggle).focus();
    } else if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        menuToggle.focus();
    }
});

function updateCartCount(count) {
    const parsedCount = Number(count);
    const safeCount = Number.isFinite(parsedCount) ? Math.max(0, Math.floor(parsedCount)) : 0;
    const displayCount = safeCount > 99 ? "99+" : String(safeCount);

    document.getElementById("cart-count").textContent = displayCount;
    document.getElementById("mobile-cart-count").textContent = displayCount;
}

window.updateCartCount = updateCartCount;

function showDemoNotice(formId, messageId, message) {
    const form = document.getElementById(formId);
    const status = document.getElementById(messageId);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        status.textContent = message;
    });
}

showDemoNotice(
    "profile-form",
    "profile-message",
    "Дані перевірені браузером, але не збережені. Підключіть сервер, щоб зберігати профіль."
);

showDemoNotice(
    "password-form",
    "password-message",
    "Пароль не змінено: для цього потрібні серверна авторизація та перевірка поточного пароля."
);

showDemoNotice(
    "email-form",
    "email-message",
    "Email не змінено: для цього потрібні серверне збереження та підтвердження адреси."
);

document.getElementById("password-form").addEventListener("submit", (event) => {
    const newPassword = document.getElementById("new-password");
    const confirmPassword = document.getElementById("confirm-password");

    if (newPassword.value !== confirmPassword.value) {
        event.preventDefault();
        confirmPassword.setCustomValidity("Паролі не збігаються.");
        confirmPassword.reportValidity();
        document.getElementById("password-message").textContent =
            "Введіть однакові значення в полях нового пароля.";
        return;
    }

    confirmPassword.setCustomValidity("");
});

document.getElementById("confirm-password").addEventListener("input", (event) => {
    event.currentTarget.setCustomValidity("");
});

const cartProducts = [
    { id: "face-cream", name: "Крем для обличчя", price: 420, quantity: 1 },
    { id: "serum", name: "Зволожувальна сироватка", price: 560, quantity: 1 },
    { id: "care-set", name: "Набір для догляду", price: 890, quantity: 1 }
];

const cartItemsElement = document.getElementById("cart-items");
const cartTotalElement = document.getElementById("cart-total");
const orderForm = document.getElementById("order-form");
const orderMessage = document.getElementById("order-message");
const orderButton = orderForm.querySelector('button[type="submit"]');
const differentRecipient = document.getElementById("different-recipient");
const recipientFields = document.getElementById("recipient-fields");
const recipientName = document.getElementById("recipient-name");
const recipientPhone = document.getElementById("recipient-phone");

function formatPrice(amount) {
    return `${new Intl.NumberFormat("uk-UA").format(amount)} грн`;
}

function renderCart() {
    const totalQuantity = cartProducts.reduce((sum, product) => sum + product.quantity, 0);
    const totalPrice = cartProducts.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0
    );

    updateCartCount(totalQuantity);
    cartTotalElement.textContent = formatPrice(totalPrice);
    cartItemsElement.replaceChildren();

    if (cartProducts.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "cart-empty";
        emptyMessage.textContent = "Кошик порожній. Додайте товари з каталогу.";
        cartItemsElement.append(emptyMessage);
        orderButton.disabled = true;
        return;
    }

    orderButton.disabled = false;

    cartProducts.forEach((product) => {
        const item = document.createElement("article");
        item.className = "cart-item";
        const info = document.createElement("div");
        info.className = "cart-item-info";
        const name = document.createElement("h4");
        name.textContent = product.name;
        const price = document.createElement("p");
        price.textContent = `${formatPrice(product.price)} за шт.`;
        info.append(name, price);

        const controls = document.createElement("div");
        controls.className = "cart-item-controls";
        const decreaseButton = document.createElement("button");
        decreaseButton.className = "quantity-button";
        decreaseButton.type = "button";
        decreaseButton.dataset.action = "decrease";
        decreaseButton.dataset.id = product.id;
        decreaseButton.setAttribute("aria-label", `Зменшити кількість: ${product.name}`);
        decreaseButton.disabled = product.quantity === 1;
        decreaseButton.textContent = "−";

        const quantity = document.createElement("span");
        quantity.className = "quantity-value";
        quantity.setAttribute("aria-label", "Кількість");
        quantity.textContent = String(product.quantity);

        const increaseButton = document.createElement("button");
        increaseButton.className = "quantity-button";
        increaseButton.type = "button";
        increaseButton.dataset.action = "increase";
        increaseButton.dataset.id = product.id;
        increaseButton.setAttribute("aria-label", `Збільшити кількість: ${product.name}`);
        increaseButton.textContent = "+";

        const removeButton = document.createElement("button");
        removeButton.className = "remove-item";
        removeButton.type = "button";
        removeButton.dataset.action = "remove";
        removeButton.dataset.id = product.id;
        removeButton.setAttribute("aria-label", `Видалити: ${product.name}`);
        const trashIcon = document.createElement("i");
        trashIcon.className = "fa-solid fa-trash";
        trashIcon.setAttribute("aria-hidden", "true");
        removeButton.append(trashIcon);

        controls.append(decreaseButton, quantity, increaseButton, removeButton);
        item.append(info, controls);
        cartItemsElement.append(item);
    });
}

cartItemsElement.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
        return;
    }

    const productIndex = cartProducts.findIndex((product) => product.id === button.dataset.id);
    if (productIndex < 0) {
        return;
    }

    const product = cartProducts[productIndex];
    if (button.dataset.action === "increase") {
        product.quantity += 1;
    } else if (button.dataset.action === "decrease" && product.quantity > 1) {
        product.quantity -= 1;
    } else if (button.dataset.action === "remove") {
        cartProducts.splice(productIndex, 1);
    }

    orderMessage.textContent = "";
    renderCart();
});

differentRecipient.addEventListener("change", () => {
    const isDifferentRecipient = differentRecipient.checked;
    recipientFields.hidden = !isDifferentRecipient;
    recipientName.disabled = !isDifferentRecipient;
    recipientPhone.disabled = !isDifferentRecipient;
    recipientName.required = isDifferentRecipient;
    recipientPhone.required = isDifferentRecipient;
});

orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    orderMessage.textContent =
        "Форма перевірена, але замовлення не передано продавцю. Для реального оформлення підключіть сервер.";
});

renderCart();

const customerReviewStorageKey = "beauty-for-every-day-customer-reviews";
const reviewForm = document.getElementById("review-form");
const reviewMessage = document.getElementById("review-message");
const reviewList = document.getElementById("review-list");
const reviewAverage = document.getElementById("review-average");
const reviewSummaryStars = document.getElementById("review-summary-stars");
const reviewCount = document.getElementById("review-count");

function loadCustomerReviews() {
    try {
        const savedReviews = JSON.parse(localStorage.getItem(customerReviewStorageKey) || "[]");
        if (!Array.isArray(savedReviews)) {
            return [];
        }

        return savedReviews
            .filter((review) => review &&
                typeof review.id === "string" &&
                typeof review.author === "string" &&
                typeof review.text === "string" &&
                Number.isInteger(review.rating) &&
                review.rating >= 1 &&
                review.rating <= 5)
            .map((review) => ({
                ...review,
                reply: typeof review.reply === "string" ? review.reply : "",
                repliedAt: typeof review.repliedAt === "string" ? review.repliedAt : ""
            }));
    } catch {
        return [];
    }
}

const customerReviews = loadCustomerReviews();

function saveCustomerReviews() {
    try {
        localStorage.setItem(customerReviewStorageKey, JSON.stringify(customerReviews));
        return true;
    } catch {
        return false;
    }
}

function formatReviewCount(count) {
    if (count === 0) {
        return "Відгуків поки немає";
    }

    const pluralForm = new Intl.PluralRules("uk-UA").select(count);
    const noun = pluralForm === "one" ? "відгук" : pluralForm === "few" ? "відгуки" : "відгуків";
    return `${count} ${noun}`;
}

function formatReviewDate(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return "Дата невідома";
    }

    return new Intl.DateTimeFormat("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(date);
}

function renderReviewSummary() {
    const reviewTotal = customerReviews.length;
    const average = reviewTotal
        ? customerReviews.reduce((sum, review) => sum + review.rating, 0) / reviewTotal
        : 0;
    const filledStars = Math.round(average);

    reviewAverage.textContent = reviewTotal
        ? new Intl.NumberFormat("uk-UA", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(average)
        : "—";
    reviewSummaryStars.textContent = `${"★".repeat(filledStars)}${"☆".repeat(5 - filledStars)}`;
    reviewCount.textContent = formatReviewCount(reviewTotal);
}

function createReviewCard(review) {
    const card = document.createElement("article");
    card.className = "review-card";

    const header = document.createElement("header");
    header.className = "review-card-header";

    const author = document.createElement("h3");
    author.textContent = review.author;

    const date = document.createElement("time");
    date.dateTime = review.createdAt;
    date.textContent = formatReviewDate(review.createdAt);
    header.append(author, date);

    const rating = document.createElement("span");
    rating.className = "review-card-rating";
    rating.setAttribute("aria-label", `Оцінка ${review.rating} з 5`);
    rating.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`;

    const body = document.createElement("p");
    body.className = "review-card-text";
    body.textContent = review.text;
    card.append(header, rating, body);

    if (review.reply) {
        const response = document.createElement("div");
        response.className = "review-owner-response";
        const responseTitle = document.createElement("h4");
        responseTitle.textContent = "Відповідь магазину";
        const responseText = document.createElement("p");
        responseText.textContent = review.reply;
        response.append(responseTitle, responseText);
        card.append(response);
    }

    const replyForm = document.createElement("form");
    replyForm.className = "review-reply-form";
    replyForm.dataset.reviewId = review.id;

    const replyLabel = document.createElement("label");
    const replyInput = document.createElement("textarea");
    replyInput.id = `review-reply-${review.id}`;
    replyInput.name = "reply";
    replyInput.rows = 3;
    replyInput.maxLength = 600;
    replyInput.required = true;
    replyInput.placeholder = "Напишіть відповідь на відгук";
    replyInput.value = review.reply;
    replyLabel.htmlFor = replyInput.id;
    replyLabel.textContent = "Відповідь власника магазину";

    const replyButton = document.createElement("button");
    replyButton.className = "form-button";
    replyButton.type = "submit";
    replyButton.textContent = review.reply ? "Оновити відповідь" : "Відповісти";

    const replyMessage = document.createElement("p");
    replyMessage.className = "review-reply-message";
    replyMessage.setAttribute("aria-live", "polite");

    replyForm.append(replyLabel, replyInput, replyButton, replyMessage);
    card.append(replyForm);
    return card;
}

function renderCustomerReviews() {
    renderReviewSummary();
    reviewList.replaceChildren();

    if (customerReviews.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "review-empty";
        emptyMessage.textContent = "Будьте першими — поділіться враженнями про магазин.";
        reviewList.append(emptyMessage);
        return;
    }

    customerReviews.forEach((review) => {
        reviewList.append(createReviewCard(review));
    });
}

reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(reviewForm);
    const author = String(formData.get("author") || "").trim();
    const text = String(formData.get("text") || "").trim();
    const rating = Number(formData.get("rating"));

    if (author.length < 2 || text.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        reviewMessage.textContent = "Вкажіть ім’я, оцінку та відгук щонайменше з 10 символів.";
        return;
    }

    const newReview = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        author,
        rating,
        text,
        createdAt: new Date().toISOString(),
        reply: "",
        repliedAt: ""
    };

    customerReviews.unshift(newReview);
    if (!saveCustomerReviews()) {
        customerReviews.shift();
        reviewMessage.textContent = "Не вдалося зберегти відгук у цьому браузері.";
        return;
    }

    reviewForm.reset();
    reviewMessage.textContent = "Дякуємо! Відгук збережено в цьому браузері.";
    renderCustomerReviews();
});

reviewList.addEventListener("submit", (event) => {
    const replyForm = event.target.closest(".review-reply-form");
    if (!replyForm) {
        return;
    }

    event.preventDefault();
    const replyInput = replyForm.querySelector("textarea");
    const replyMessage = replyForm.querySelector(".review-reply-message");
    const replyText = replyInput.value.trim();
    const review = customerReviews.find((item) => item.id === replyForm.dataset.reviewId);

    if (!review || replyText.length < 2) {
        replyMessage.textContent = "Введіть відповідь перед публікацією.";
        return;
    }

    const previousReply = review.reply;
    const previousRepliedAt = review.repliedAt;
    review.reply = replyText;
    review.repliedAt = new Date().toISOString();

    if (!saveCustomerReviews()) {
        review.reply = previousReply;
        review.repliedAt = previousRepliedAt;
        replyMessage.textContent = "Не вдалося зберегти відповідь у цьому браузері.";
        return;
    }

    renderCustomerReviews();
});

renderCustomerReviews();