// Завдання 1: створення списку з літерами імені
const nameList = document.getElementById('name-list');
const myName = ['І', 'в', 'а', 'н'];

// Перебираємо масив та додаємо літери до списку
for (const letter of myName) {
    const li = document.createElement('li');
    li.textContent = letter;

    li.addEventListener('mouseover', () => {
        alert(`Це літера ${letter}`);
    });

    nameList.appendChild(li);
}

// Завдання 2: введення прізвищ та імен студентів
const btnStudents = document.getElementById('btn-students');
const studentsDiv = document.getElementById('students');

// Функція запитує дані та додає їх на сторінку
function askStudent() {
    const studentName = prompt('Введіть прізвище і ім\'я (або натисніть Відміна):');

    if (studentName !== null) {
        const p = document.createElement('p');
        p.textContent = studentName;
        studentsDiv.appendChild(p);

        // Повторний виклик функції через невелику затримку
        setTimeout(askStudent, 10);
    }
}

// Завдання 3: створення блоків з літерами прізвища
const btnLetters = document.getElementById('btn-letters');
const lettersContainer = document.getElementById('letters');
const mySurname = ['Г', 'а', 'л', 'ю', 'к'];

// Змінна для перевірки стану відображення блоків
let isShown = false;

btnLetters.addEventListener('click', () => {
    if (isShown === false) {
        for (const sLetter of mySurname) {
            const div = document.createElement('div');
            div.textContent = sLetter;

            div.addEventListener('mouseover', () => {
                alert(`Це літера [ ${sLetter} ]`);
            });

            lettersContainer.appendChild(div);
        }
        isShown = true;
    } else {
        lettersContainer.textContent = '';
        isShown = false;
    }
});

btnStudents.addEventListener('click', () => {
    askStudent();
});