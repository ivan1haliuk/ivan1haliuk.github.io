// Товари надходять із JSON.
let products = [];
let catalogLoaded = false;

const storageKey = "lb14-washing-machine-cart";
const maxQuantity = 999;
let storageAvailable = true;
let cart = [];
let selectedProductId = null;
let quantityMode = "add";
let previousFocus = null;
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalText = document.getElementById("modal-text");
const quantityForm = document.getElementById("quantity-form");
const quantityInput = document.getElementById("quantity");
const quantityError = document.getElementById("quantity-error");
const messageActions = document.getElementById("message-actions");
const modalCartLink = document.getElementById("modal-cart-link");
const continueButton = document.getElementById("modal-continue");
const basketItems = document.getElementById("basket-items");
// Пошук товару за id.
function findProduct(id) {
    for (let i = 0; i < products.length; i++) {
        if (products[i].id === id) {
            return products[i];
        }
    }
    return null;
}

function findCartItem(id) {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
            return cart[i];
        }
    }
    return null;
}

function isValidQuantity(quantity) {
    return Number.isInteger(quantity) && quantity >= 1 && quantity <= maxQuantity;
}
// Читаємо збережену корзину.
function loadCart() {
    const result = [];
    let savedCart;
    try {
        savedCart = localStorage.getItem(storageKey);
    } catch (error) {
        storageAvailable = false;
        return result;
    }

    if (savedCart === null) {
        return result;
    }

    try {
        savedCart = JSON.parse(savedCart);
    } catch (error) {
        return result;
    }

    if (!Array.isArray(savedCart)) {
        return result;
    }

    for (let i = 0; i < savedCart.length; i++) {
        const item = savedCart[i];
        if (!item || !findProduct(item.id) || !findProduct(item.id).available || !isValidQuantity(item.quantity)) {
            continue;
        }
        let duplicate = false;
        for (let j = 0; j < result.length; j++) {
            if (result[j].id === item.id) {
                result[j].quantity = Math.min(result[j].quantity + item.quantity, maxQuantity);
                duplicate = true;
                break;
            }
        }
        if (!duplicate) {
            result.push({ id: item.id, quantity: item.quantity });
        }
    }
    return result;
}

// Зберігаємо корзину.
function saveCart() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(cart));
        storageAvailable = true;
    } catch (error) {
        storageAvailable = false;
    }
    showStorageWarning();
}

function showStorageWarning() {
    const warning = document.getElementById("storage-warning");
    warning.hidden = storageAvailable;
    warning.textContent = t("storageWarning");
}
function formatPrice(price) {
    return price.toLocaleString(currentLanguage === "uk" ? "uk-UA" : "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " " + t("currency");
}

function updateCartCount() {
    document.getElementById("cart-count").textContent = cart.length;
    document.getElementById("cart-link").setAttribute("aria-label", t("cartAria", { amount: cart.length }));
}
// Відкриваємо модальне вікно.
function openModal() {
    if (modal.hidden) {
        previousFocus = document.activeElement;
    }
    modal.hidden = false;
    document.body.classList.add("modal-open");
}

function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (previousFocus && previousFocus.isConnected) {
        previousFocus.focus();
    } else {
        document.getElementById("cart-link").focus();
    }
}

function showMessage(title, text, addedToCart) {
    modalTitle.textContent = title;
    modalText.textContent = text;
    quantityForm.hidden = true;
    messageActions.hidden = false;
    modalCartLink.hidden = !addedToCart;
    continueButton.textContent = t(addedToCart ? "backShopping" : "understood");
    openModal();
    if (addedToCart) {
        modalCartLink.focus();
    } else {
        continueButton.focus();
    }
}

function showQuantityModal(id, mode) {
    const product = findProduct(id);
    if (!product || !product.available) {
        return;
    }
    selectedProductId = id;
    quantityMode = mode;
    modalTitle.textContent = t("quantityTitle");
    modalText.textContent = productName(product);
    quantityForm.hidden = false;
    messageActions.hidden = true;
    quantityError.textContent = "";
    quantityInput.removeAttribute("aria-invalid");
    quantityInput.value = mode === "edit" ? findCartItem(id).quantity : 1;
    document.getElementById("quantity-submit").textContent = t(mode === "edit" ? "saveChanges" : "addSubmit");
    openModal();
    quantityInput.focus();
    quantityInput.select();
}
// Додаємо товар або змінюємо кількість.
quantityForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const quantity = Number(quantityInput.value);
    if (!isValidQuantity(quantity)) {
        quantityError.textContent = t("quantityError", { maximum: maxQuantity });
        quantityInput.setAttribute("aria-invalid", "true");
        quantityInput.focus();
        return;
    }

    const item = findCartItem(selectedProductId);
    if (quantityMode === "add" && item && item.quantity + quantity > maxQuantity) {
        quantityError.textContent = t("quantityLimit", { amount: item.quantity, maximum: maxQuantity });
        quantityInput.setAttribute("aria-invalid", "true");
        quantityInput.focus();
        return;
    }

    if (quantityMode === "edit") {
        if (!item) {
            closeModal();
            return;
        }
        item.quantity = quantity;
    } else if (item) {
        item.quantity += quantity;
    } else {
        cart.push({ id: selectedProductId, quantity: quantity });
    }

    saveCart();
    updateCartCount();
    renderBasket();
    if (quantityMode === "edit") {
        closeModal();
    } else {
        const product = findProduct(selectedProductId);
        showMessage(t("addedTitle"), t("addedMessage", { name: productName(product), amount: quantity }), true);
    }
});

document.getElementById("cart-link").addEventListener("click", function (event) {
    if (!catalogLoaded) {
        event.preventDefault();
        showMessage(t("pendingTitle"), t("pendingMessage"), false);
        return;
    }
    if (cart.length === 0) {
        event.preventDefault();
        showMessage(t("emptyTitle"), t("emptyMessage"), false);
    }
});
function addCell(row, text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
    return cell;
}

// Створюємо рядки таблиці та рахуємо суму.
function renderBasket() {
    if (!basketItems) {
        return;
    }
    basketItems.textContent = "";
    let total = 0;

    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const product = findProduct(item.id);
        const sum = product.price * item.quantity;
        total += sum;

        const row = document.createElement("tr");
        addCell(row, i + 1);
        addCell(row, productName(product));
        addCell(row, formatPrice(product.price));

        const quantityCell = addCell(row, item.quantity);
        quantityCell.className = "quantity-cell";
        const changeButton = document.createElement("button");
        changeButton.type = "button";
        changeButton.className = "text-button change-quantity";
        changeButton.textContent = t("changeQuantity");
        changeButton.setAttribute("aria-label", t("changeQuantityAria", { name: productName(product) }));
        changeButton.addEventListener("click", function () {
            showQuantityModal(item.id, "edit");
        });
        quantityCell.appendChild(changeButton);

        addCell(row, formatPrice(sum));
        const actionCell = addCell(row, "");
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "text-button remove-product";
        removeButton.textContent = t("remove");
        removeButton.setAttribute("aria-label", t("removeAria", { name: productName(product) }));
        removeButton.addEventListener("click", function () {
            removeProduct(item.id);
        });
        actionCell.appendChild(removeButton);
        basketItems.appendChild(row);
    }

    document.getElementById("basket-total").textContent = formatPrice(total);
    document.getElementById("empty-cart").hidden = cart.length !== 0;
    document.getElementById("basket-table-container").hidden = cart.length === 0;
    document.getElementById("pay-link").hidden = cart.length === 0;
}

// Видаляємо товар із корзини.
function removeProduct(id) {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === id) {
            cart.splice(i, 1);
            break;
        }
    }
    saveCart();
    updateCartCount();
    renderBasket();
}
const payLink = document.getElementById("pay-link");
if (payLink) {
    payLink.addEventListener("click", function (event) {
        event.preventDefault();
        showMessage(t("paymentTitle"), t("paymentMessage", { total: document.getElementById("basket-total").textContent }), false);
    });
}
document.getElementById("modal-close").addEventListener("click", closeModal);
continueButton.addEventListener("click", closeModal);
modal.addEventListener("click", function (event) {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (modal.hidden) {
        return;
    }
    if (event.key === "Escape") {
        closeModal();
    }
    if (event.key === "Tab") {
        const elements = modal.querySelectorAll("button, a[href], input");
        const visibleElements = [];
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].getClientRects().length > 0) {
                visibleElements.push(elements[i]);
            }
        }
        const first = visibleElements[0];
        const last = visibleElements[visibleElements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});
function refreshCart() {
    if (!catalogLoaded) {
        return;
    }
    cart = loadCart();
    updateCartCount();
    renderBasket();
    showStorageWarning();
    if (!modal.hidden) {
        closeModal();
    }
}

window.addEventListener("pageshow", refreshCart);
window.addEventListener("storage", function (event) {
    if (event.key === storageKey || event.key === null) {
        refreshCart();
    }
});
function appendText(parent, tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    if (typeof text === "string") {
        element.textContent = text;
    }
    parent.appendChild(element);
    return element;
}
// Створюємо картки з даних JSON.
function renderCatalog() {
    const container = document.getElementById("product-container");
    if (!container) {
        return;
    }
    document.getElementById("catalog-title").textContent = t("catalogTitle");
    container.textContent = "";
    const leftArrow = appendText(container, "span", "arrow arrow-left", "<");
    leftArrow.setAttribute("aria-hidden", "true");
    const rightArrow = appendText(container, "span", "arrow arrow-right", ">");
    rightArrow.setAttribute("aria-hidden", "true");

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const card = appendText(container, "article", "product-card");
        if (product.badge === "new" || product.badge === "hit") {
            appendText(card, "div", product.badge === "new" ? "badge badge-new" : "badge badge-hit",
                t(product.badge === "new" ? "new" : "hit"));
        }
        appendText(card, "div", "category-name", t("category_" + product.id));
        appendText(card, "hr", "divider");

        const image = appendText(card, "img", "product-image");
        image.src = product.image;
        image.alt = productName(product);
        image.width = 200;
        image.height = 200;
        const title = appendText(card, "a", "product-title", productName(product).toUpperCase());
        title.href = product.url;
        title.target = "_blank";
        title.rel = "noopener noreferrer";
        appendText(card, "p", "product-description", t("description_" + product.id));

        const priceBlock = appendText(card, "div", "price-block");
        if (product.available) {
            if (product.oldPrice) {
                appendText(priceBlock, "span", "old-price", formatPrice(product.oldPrice));
            }
            appendText(priceBlock, "span", "new-price", formatPrice(product.price));
        } else {
            appendText(priceBlock, "span", "availability", t("expected"));
        }
        const button = appendText(card, "button", product.available ? "btn btn-yellow add-to-cart" : "btn btn-pink",
            t(product.available ? "addCart" : "unavailable"));
        button.type = "button";
        button.disabled = !product.available;
        button.dataset.productId = product.id;
        if (product.available) {
            button.addEventListener("click", function () {
                showQuantityModal(product.id, "add");
            });
        }
    }
    container.hidden = false;
}

let catalogRequested = false;
let catalogFailed = false;
const catalogStatus = document.getElementById("catalog-status");
const retryButton = document.getElementById("catalog-retry");
// Отримуємо JSON запитом XMLHttpRequest.
function loadCatalog() {
    catalogRequested = true;
    catalogFailed = false;
    catalogStatus.hidden = false;
    catalogStatus.textContent = t("loading");
    retryButton.hidden = true;
    const request = new XMLHttpRequest();
    request.open("GET", "data/catalog.json");
    request.responseType = "json";
    request.timeout = 10000;

    request.onload = function () {
        if (request.status !== 200) {
            showCatalogError();
            return;
        }
        const data = request.response;
        if (!data || typeof data.title !== "string" || !Array.isArray(data.products) || data.products.length < 6) {
            showCatalogError();
            return;
        }
        const ids = [];
        for (let i = 0; i < data.products.length; i++) {
            const product = data.products[i];
            if (!product || typeof product.id !== "string" || ids.includes(product.id) ||
                typeof product.name !== "string" || typeof product.category !== "string" ||
                typeof product.description !== "string" || typeof product.image !== "string" ||
                typeof product.url !== "string" || !Number.isFinite(product.price) || product.price <= 0 ||
                typeof product.available !== "boolean") {
                showCatalogError();
                return;
            }
            ids.push(product.id);
        }
        products = data.products;
        catalogLoaded = true;
        renderCatalog();
        refreshCart();
        catalogStatus.hidden = true;
    };
    request.onerror = showCatalogError;
    request.ontimeout = showCatalogError;
    request.send();
}

function showCatalogError() {
    catalogFailed = true;
    catalogStatus.textContent = t("catalogError");
    retryButton.hidden = false;
}

retryButton.addEventListener("click", loadCatalog);

const useI18next = document.body.dataset.translation === "i18next";
const languageKey = "lb14-language";
let currentLanguage = "uk";
let translations = {};
const languageSelector = document.getElementById("language-selector");
const languageModal = document.getElementById("language-modal");
const languageError = document.getElementById("language-error");
const languageSubmit = document.getElementById("language-submit");
const siteContent = document.getElementById("site-content");
const startupStatus = document.getElementById("startup-status");

// Отримуємо переклад тексту.
function t(key, values) {
    if (useI18next) {
        return i18next.t(key, values);
    }
    let text = translations[currentLanguage][key] || key;
    if (values) {
        for (const name in values) {
            text = text.replaceAll("{{" + name + "}}", String(values[name]));
        }
    }
    return text;
}

function productName(product) {
    return t("name_" + product.id);
}

// Оновлюємо тексти сторінки та кошика.
function applyLanguage() {
    document.documentElement.lang = currentLanguage;
    document.title = t(basketItems ? "basketPageTitle" : "pageTitle");
    const elements = document.querySelectorAll("[data-i18n]");
    for (let i = 0; i < elements.length; i++) {
        elements[i].textContent = t(elements[i].dataset.i18n);
    }
    const labels = document.querySelectorAll("[data-i18n-label]");
    for (let i = 0; i < labels.length; i++) {
        labels[i].setAttribute("aria-label", t(labels[i].dataset.i18nLabel));
    }
    languageSelector.value = currentLanguage;
    updateCartCount();
    showStorageWarning();
    if (catalogLoaded) {
        renderCatalog();
        renderBasket();
    } else {
        catalogStatus.textContent = t(catalogFailed ? "catalogError" : "loading");
    }
    if (!modal.hidden) {
        closeModal();
    }
}

async function selectLanguage(language, remember) {
    if (language !== "uk" && language !== "en") {
        return;
    }
    languageSelector.disabled = true;
    languageSubmit.disabled = true;
    if (useI18next) {
        await i18next.changeLanguage(language);
    }
    currentLanguage = language;
    applyLanguage();
    if (remember) {
        try {
            localStorage.setItem(languageKey, language);
        } catch (error) {
            console.error("Не вдалося зберегти мову:", error);
        }
    }
    languageModal.hidden = true;
    document.body.classList.remove("modal-open");
    startupStatus.hidden = true;
    siteContent.hidden = false;
    languageSelector.disabled = false;
    languageSubmit.disabled = false;
    if (!catalogRequested) {
        loadCatalog();
    }
}

// Завантажуємо файли перекладів.
async function initLanguages() {
    let savedLanguage = null;
    try {
        savedLanguage = localStorage.getItem(languageKey);
    } catch (error) {
        savedLanguage = null;
    }
    if (savedLanguage !== "uk" && savedLanguage !== "en") {
        languageModal.hidden = false;
        document.body.classList.add("modal-open");
    }
    languageSubmit.disabled = true;
    languageError.textContent = "";
    try {
        const ukResponse = await fetch("locales/uk.json");
        const enResponse = await fetch("locales/en.json");
        if (!ukResponse.ok || !enResponse.ok) {
            throw new Error("Translation request failed");
        }
        translations = { uk: await ukResponse.json(), en: await enResponse.json() };
        if (useI18next) {
            if (typeof i18next === "undefined") {
                throw new Error("i18next is unavailable");
            }
            const resources = {
                uk: { translation: translations.uk },
                en: { translation: translations.en }
            };
            await i18next.init({ lng: "uk", fallbackLng: "uk", resources, interpolation: { escapeValue: false } });
        }
        languageSubmit.disabled = false;
        if (savedLanguage === "uk" || savedLanguage === "en") {
            await selectLanguage(savedLanguage, false);
        } else {
            startupStatus.hidden = true;
            document.getElementById("initial-language").focus();
        }
    } catch (error) {
        console.error("Translation loading error:", error);
        languageModal.hidden = false;
        languageError.textContent = "Помилка перекладів. Оновіть сторінку. / Translation error. Reload the page.";
    }
}

languageSelector.addEventListener("change", function () {
    selectLanguage(this.value, true);
});
document.getElementById("language-form").addEventListener("submit", function (event) {
    event.preventDefault();
    selectLanguage(document.getElementById("initial-language").value, true);
});

initLanguages();
