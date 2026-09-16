// # 1
// Перевірка області видимості змінних
function calculate() {
    let result = 100; // початкове значення змінної
    if (true) {
        let result = 50; // блочна змінна
        console.log("Inside if:", result); // виведення значення всередині блоку
    }
    console.log("Outside if:", result); // виведення значення поза блоком
}
calculate();
// # 2
// Перевірка числа, введеного користувачем
const secretNumber = 2 % 10; 
let guess = prompt("Enter a number from 0 to 9:"); 

if (Number(guess) === secretNumber) { // перевірка правильності числа
    alert("Correct!"); 
} else {
    alert("Wrong!"); 
}
// # 3
// Введення даних та обчислення суми
let userName = prompt("Enter your name:"); 
let num1 = prompt("Enter first number:"); 
let num2 = prompt("Enter second number:");

let sum = Number(num1) + Number(num2); 

console.log("Hello, " + userName + "! The sum of " + num1 + " and " + num2 + " is " + sum); 