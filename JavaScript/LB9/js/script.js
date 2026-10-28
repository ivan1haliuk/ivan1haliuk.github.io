const loader = document.getElementById("loader");
const result = document.getElementById("result");
const compareForm = document.getElementById("compare-form");
const compareButton = document.getElementById("compare-button");
const sumButton = document.getElementById("sum-button");

// Завдання 0. Показуємо лоадер перед запуском Promise.
function showLoader() {
    loader.style.display = "block";
    result.textContent = "";
    result.className = "";
    compareButton.disabled = true;
    sumButton.disabled = true;
}

// Ховаємо лоадер після успішного виконання або помилки.
function hideLoader() {
    loader.style.display = "none";
    compareButton.disabled = false;
    sumButton.disabled = false;
}

// Завдання 4. Порівняння двох чисел із затримкою 1 секунда.
function compareNumbers(num1, num2) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (num1 > num2) {
                resolve("Перше число більше");
            } else if (num1 < num2) {
                resolve("Друге число більше");
            } else {
                reject("Числа рівні");
            }
        }, 1000);
    });
}

compareForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const num1 = Number(document.getElementById("num1").value);
    const num2 = Number(document.getElementById("num2").value);

    showLoader();

    compareNumbers(num1, num2)
        .then((message) => {
            result.textContent = message;
            result.className = "success";
            hideLoader();
        })
        .catch((error) => {
            result.textContent = error;
            result.className = "error";
            hideLoader();
        });
});

// Завдання 5. Три Promise з випадковими числами від 1 до 10.
sumButton.addEventListener("click", () => {
    showLoader();

    const promises = [
        new Promise((resolve) => {
            setTimeout(() => {
                resolve(Math.floor(Math.random() * 10) + 1);
            }, 1000);
        }),
        new Promise((resolve) => {
            setTimeout(() => {
                resolve(Math.floor(Math.random() * 10) + 1);
            }, 2000);
        }),
        new Promise((resolve) => {
            setTimeout(() => {
                resolve(Math.floor(Math.random() * 10) + 1);
            }, 3000);
        })
    ];

    Promise.all(promises)
        .then((numbers) => {
            const sum = numbers[0] + numbers[1] + numbers[2];

            result.textContent = "Випадкові числа: " + numbers.join(", ") +
                "\nСума чисел: " + sum;
            result.className = "success";
            hideLoader();
        })
        .catch((error) => {
            result.textContent = error;
            result.className = "error";
            hideLoader();
        });
});