// Завдання 1
let min = parseInt(prompt("Мінімум:", "1")) || 1;
let max = parseInt(prompt("Максимум:", "100")) || 100;

function* rGen(a, b) { // генератор
    while (true) {
        yield Math.floor(Math.random() * (b - a + 1)) + a; // випадкове число
    }
}

const g1 = rGen(min, max);

document.getElementById('btn-next').addEventListener('click', () => { 
    document.getElementById('out').innerText = `Число: ${g1.next().value}`; // нове число по кліку
});


// Завдання 2
function* pGen() {
    let pass = "";
    while (true) {
        const c = yield; // отримуємо символ
        
        if (c === 'done') return pass; // вихід
        if (c) pass += c; 
    }
}

const g2 = pGen();
g2.next(); // старт

while (true) {
    let val = prompt("Символ для пароля (або 'done'):"); 
    if (val === 'done') {
        alert(`Пароль: ${g2.next('done').value}`); // готовий пароль
        break;
    } else if (val) {
        g2.next(val);
    }
}


// Завдання 3
function* botGen() {
    const name = yield "Hi! What is your name?"; 
    yield `Nice to meet you, ${name}! How are you?`; // ім'я у відповіді
    return "Goodbye!"; 
}

const bot = botGen();

let q1 = bot.next().value; 
let ans = prompt(q1); 

let q2 = bot.next(ans).value; // передаємо відповідь назад
prompt(q2); 

alert(bot.next().value);

// Завдання 4
const user = { 
    name: "Іван Галюк",
    say() {
        alert(`Hello, ${this.name}`); // виводить ім'я
    }
};

const btn = document.getElementById('btn-say');

// bind зафіксував this, щоб він не губився при кліку
btn.addEventListener('click', user.say.bind(user));