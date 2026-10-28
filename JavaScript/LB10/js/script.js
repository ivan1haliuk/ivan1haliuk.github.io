// Дані товарів і стан корзини. Кожна позиція корзини містить id товару
// та його кількість; ціна й назва беруться з масиву products.
const products = [
    { id: "samsung", name: "Пральна машина Samsung WW90DG6G94LBUA", price: 26999 },
    { id: "hisense", name: "Пральна машина Hisense WF5I9043BBFS", price: 23999 },
    { id: "lg", name: "Пральна машина LG F2X5FS2WB", price: 28999 }
];

const storageKey = "lb10-washing-machine-cart";
const maxQuantity = 999;
let storageAvailable = true;
let cart = loadCart();
let selectedProductId = null;
let quantityMode = "add";
let previousFocus = null;

// Отримання елементів сторінки, потрібних для форми, повідомлень і таблиці.
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

// Пошук товарів за id та перевірка кількості: допускаються цілі числа від 1 до 999.
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

// Збереження корзини між переходами сторінок через localStorage.
// JSON.stringify перетворює масив на рядок, JSON.parse відновлює його.
// Під час читання перевіряються товари й кількості, а дублікати об'єднуються.
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
        if (!item || !findProduct(item.id) || !isValidQuantity(item.quantity)) {
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

// Оформлення цін у гривнях і оновлення лічильника.
// cart.length показує кількість різних найменувань у корзині.
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

// Керування модальним вікном: показ форми або повідомлення через hidden.
// Форма використовується як для додавання товару, так і для зміни кількості.
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
    if (!product) {
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

// Обробка форми та кнопок каталогу. Повторне додавання збільшує кількість
// наявної позиції. Після змін зберігаються дані й оновлюється відображення.
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

const addButtons = document.querySelectorAll(".add-to-cart");
for (let i = 0; i < addButtons.length; i++) {
    addButtons[i].addEventListener("click", function () {
        showQuantityModal(this.dataset.productId, "add");
    });
}

document.getElementById("cart-link").addEventListener("click", function (event) {
    if (cart.length === 0) {
        event.preventDefault();
        showMessage("Корзина пуста", "Додайте товар із каталогу, щоб переглянути своє замовлення.", false);
    }
});

// Побудова таблиці через DOM і видалення позицій.
// Сума рядка дорівнює ціні, помноженій на кількість; total накопичує підсумок.
// Після видалення таблиця та лічильник оновлюються.
function addCell(row, text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
    return cell;
}

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

// Посилання оплати відкриває повідомлення з поточною сумою замовлення.
const payLink = document.getElementById("pay-link");
if (payLink) {
    payLink.addEventListener("click", function (event) {
        event.preventDefault();
        showMessage("Оплата тимчасово недоступна", "Просимо вибачення за незручності. Будь ласка, спробуйте пізніше. Сума замовлення: " + document.getElementById("basket-total").textContent + ".", false);
    });
}

// Закриття вікна хрестиком, кнопкою, натисканням на фон або Escape.
// Клавіша Tab утримує фокус на елементах відкритого модального вікна.
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

// Оновлення корзини після повернення на сторінку та змін в іншій вкладці.
// Наприкінці файлу виконується початкове відображення даних.
function refreshCart() {
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

updateCartCount();
renderBasket();
showStorageWarning();
