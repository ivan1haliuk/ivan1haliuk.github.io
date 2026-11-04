// Товари надходять із JSON.
let products = [];
let catalogLoaded = false;

const storageKey = "lb13-washing-machine-cart";
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
    warning.textContent = "Браузер забороняє збереження корзини. Дозвольте локальне сховище та відкрийте сайт через GitHub Pages або локальний сервер: інакше товари можуть зникнути при переході на іншу сторінку.";
}
function formatPrice(price) {
    return price.toLocaleString("uk-UA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " грн";
}

function updateCartCount() {
    document.getElementById("cart-count").textContent = cart.length;
    document.getElementById("cart-link").setAttribute("aria-label", "Корзина, кількість найменувань: " + cart.length);
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
    continueButton.textContent = addedToCart ? "Повернутись до покупок" : "Зрозуміло";
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
    modalTitle.textContent = "Вкажіть кількість:";
    modalText.textContent = product.name;
    quantityForm.hidden = false;
    messageActions.hidden = true;
    quantityError.textContent = "";
    quantityInput.removeAttribute("aria-invalid");
    quantityInput.value = mode === "edit" ? findCartItem(id).quantity : 1;
    document.getElementById("quantity-submit").textContent = mode === "edit" ? "Зберегти зміни" : "Додати до корзини";
    openModal();
    quantityInput.focus();
    quantityInput.select();
}
// Додаємо товар або змінюємо кількість.
quantityForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const quantity = Number(quantityInput.value);
    if (!isValidQuantity(quantity)) {
        quantityError.textContent = "Введіть ціле число від 1 до " + maxQuantity + ".";
        quantityInput.setAttribute("aria-invalid", "true");
        quantityInput.focus();
        return;
    }

    const item = findCartItem(selectedProductId);
    if (quantityMode === "add" && item && item.quantity + quantity > maxQuantity) {
        quantityError.textContent = "У корзині вже є " + item.quantity + " шт. Максимум для одного товару — " + maxQuantity + " шт.";
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
        showMessage("Товар додано", product.name + " — " + quantity + " шт.", true);
    }
});

document.getElementById("cart-link").addEventListener("click", function (event) {
    if (!catalogLoaded) {
        event.preventDefault();
        showMessage("Каталог ще не завантажено", "Дочекайтеся завантаження товарів або повторіть спробу.", false);
        return;
    }
    if (cart.length === 0) {
        event.preventDefault();
        showMessage("Корзина пуста", "Додайте товар із каталогу, щоб переглянути своє замовлення.", false);
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
        addCell(row, product.name);
        addCell(row, formatPrice(product.price));

        const quantityCell = addCell(row, item.quantity);
        quantityCell.className = "quantity-cell";
        const changeButton = document.createElement("button");
        changeButton.type = "button";
        changeButton.className = "text-button change-quantity";
        changeButton.textContent = "змінити к-сть";
        changeButton.setAttribute("aria-label", "Змінити кількість: " + product.name);
        changeButton.addEventListener("click", function () {
            showQuantityModal(item.id, "edit");
        });
        quantityCell.appendChild(changeButton);

        addCell(row, formatPrice(sum));
        const actionCell = addCell(row, "");
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "text-button remove-product";
        removeButton.textContent = "видалити";
        removeButton.setAttribute("aria-label", "Видалити: " + product.name);
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
        showMessage("Оплата тимчасово недоступна", "Просимо вибачення за незручності. Будь ласка, спробуйте пізніше. Сума замовлення: " + document.getElementById("basket-total").textContent + ".", false);
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
    document.getElementById("catalog-title").textContent = catalogTitle;
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
                product.badge === "new" ? "НОВИНКА" : "ХІТ ПРОДАЖІВ");
        }
        appendText(card, "div", "category-name", product.category);
        appendText(card, "hr", "divider");

        const image = appendText(card, "img", "product-image");
        image.src = product.image;
        image.alt = product.name;
        image.width = 200;
        image.height = 200;
        const title = appendText(card, "a", "product-title", product.name.toUpperCase());
        title.href = product.url;
        title.target = "_blank";
        title.rel = "noopener noreferrer";
        appendText(card, "p", "product-description", product.description);

        const priceBlock = appendText(card, "div", "price-block");
        if (product.available) {
            if (product.oldPrice) {
                appendText(priceBlock, "span", "old-price", formatPrice(product.oldPrice));
            }
            appendText(priceBlock, "span", "new-price", formatPrice(product.price));
        } else {
            appendText(priceBlock, "span", "availability", "Очікується");
        }
        const button = appendText(card, "button", product.available ? "btn btn-yellow add-to-cart" : "btn btn-pink",
            product.available ? "У КОРЗИНУ" : "НЕЗАБАРОМ У ПРОДАЖІ");
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

let catalogTitle = "";
const catalogStatus = document.getElementById("catalog-status");
const retryButton = document.getElementById("catalog-retry");
// Отримуємо JSON запитом XMLHttpRequest.
function loadCatalog() {
    catalogStatus.hidden = false;
    catalogStatus.textContent = "Завантаження товарів...";
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
        catalogTitle = data.title;
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
    catalogStatus.textContent = "Не вдалося завантажити каталог. Перевірте інтернет і запустіть сторінку через локальний HTTP-сервер або GitHub Pages.";
    retryButton.hidden = false;
}

retryButton.addEventListener("click", loadCatalog);
loadCatalog();