//  Завдання 5 
let orders = [
    {
        orderId: 1,
        customer: { name: "Іван", email: "ivan@gmail.com" }, // дані клієнта
        items: [
            { name: "Мишка", price: 500 } // товар
        ],
        total: 500 // сума замовлення
    },
    {
        orderId: 2,
        customer: { name: "Анна", email: "anna@gmail.com" }, 
        items: [
            { name: "Клавіатура", price: 1200 } 
        ],
        total: 1200 
    },
    {
        orderId: 3,
        customer: { name: "Іван", email: "ivan@gmail.com" },
        items: [
            { name: "Килимок", price: 300 } 
        ],
        total: 300 
    }
];

function getTotalSpentByCustomer(orders, customerName) {
    let customerOrders = orders.filter(order => // фільтруємо замовлення
        order.customer.name === customerName
    );

    return customerOrders.reduce((sum, order) => // рахуємо загальну суму
        sum + order.total, 0
    );
}

document.getElementById("btn-5").addEventListener("click", () => {
    let total = getTotalSpentByCustomer(orders, "Іван"); // отримуємо витрати

    document.getElementById("out-5").innerText =
        `Клієнт Іван витратив: ${total} грн`; // виводимо результат
});


//  Завдання 6 
let products = [
    { productId: 1, name: "Телефон", price: 10000 },
    { productId: 2, name: "Чохол", price: 300 },
    { productId: 3, name: "Навушники", price: 2000 }
];
let purchases = [
    { purchaseId: 101, productId: 1, quantity: 2 },
    { purchaseId: 102, productId: 2, quantity: 5 },
    { purchaseId: 103, productId: 1, quantity: 1 },
    { purchaseId: 104, productId: 3, quantity: 2 }
];

function getTotalSales(products, purchases) {
    return purchases.reduce((result, purchase) => {

        let product = products.find(product => // шукаємо потрібний товар
            product.productId === purchase.productId
        );

        if (product) {
            let total = product.price * purchase.quantity; // рахуємо дохід

            if (result[product.name]) {
                result[product.name] += total; 
            } else {
                result[product.name] = total; // створюємо новий запис
            }
        }

        return result;
    }, {});
}

document.getElementById("btn-6").addEventListener("click", () => {
    let sales = getTotalSales(products, purchases); // отримуємо продажі

    console.log(sales); 

    let text = "";

    for (let product in sales) {
        text += `${product}: ${sales[product]} грн\n`; // формуємо текст
    }

    document.getElementById("out-6").innerText = text;
});