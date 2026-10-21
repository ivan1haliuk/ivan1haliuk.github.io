const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const taskFilter = document.getElementById('task-filter');
// Отримуємо збережені завдання з LocalStorage або створюємо порожній масив, якщо їх немає
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
// Функція для форматування дати у формат 'DD.MM.YY, HH:MM'
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Місяці починаються з 0
    const year = String(date.getFullYear()).slice(-2); // Беремо останні 2 цифри року
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year}, ${hours}:${minutes}`;
}
// Функція для збереження даних у LocalStorage та оновлення списку на екрані
function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}
// Головна функція для відмальовки списку завдань
function renderTasks() {
    taskList.innerHTML = '';
    // Отримуємо значення з селекта для фільтрації/сортування
    const filterValue = taskFilter.value;
    let filteredTasks = tasks;
    if (filterValue === 'completed') {
        filteredTasks = tasks.filter(task => task.completed === true);
    } else if (filterValue === 'uncompleted') {
        filteredTasks = tasks.filter(task => task.completed === false);
    }
    // Проходимось по масиву завдань та створюємо HTML елементи
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        // Якщо завдання виконане, додаємо відповідний клас для CSS
        if (task.completed) {
            li.classList.add('completed');
        }
        // Створюємо checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        // Подія натискання на чекбокс (зміна статусу)
        checkbox.addEventListener('change', () => {
            task.completed = true; 
            saveAndRender();
        });
        li.appendChild(checkbox);
        // Текст завдання
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;
        // Редагування завдання при подвійному кліку
        textSpan.addEventListener('dblclick', () => {
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.className = 'edit-input';
            editInput.value = task.text;
            li.replaceChild(editInput, textSpan);
            editInput.focus(); 
            // Зберігаємо зміни при натисканні Enter
            editInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (editInput.value.trim() !== '') {
                        task.text = editInput.value.trim();
                    }
                    saveAndRender();
                }
            });
            // Зберігаємо зміни, якщо користувач клікнув поза інпутом
            editInput.addEventListener('blur', () => {
                if (editInput.value.trim() !== '') {
                    task.text = editInput.value.trim();
                }
                saveAndRender();
            });
        });
        li.appendChild(textSpan);
        // Дата та час додавання
        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        dateSpan.textContent = formatDateTime(task.createdAt);
        li.appendChild(dateSpan);
        // Кнопка-хрестик для видалення завдання
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'X';
        // Подія видалення
        deleteBtn.addEventListener('click', () => {
            // Залишаємо в масиві всі завдання, крім того, яке видаляємо
            tasks = tasks.filter(t => t.id !== task.id);
            saveAndRender();
        });
        li.appendChild(deleteBtn);
        // Додаємо сформований <li> у список (<ul>)
        taskList.appendChild(li);
    });
}
// Додавання нового завдання при натисканні на клавішу Enter
taskInput.addEventListener('keydown', (e) => {
    // Перевіряємо чи натиснуто Enter і чи поле не порожнє
    if (e.key === 'Enter' && taskInput.value.trim() !== '') {
        const newTask = {
            id: Date.now(), 
            text: taskInput.value.trim(), 
            completed: false, 
            createdAt: new Date().toISOString() 
        };
        tasks.push(newTask); 
        taskInput.value = ''; 
        saveAndRender(); 
    }
});
taskFilter.addEventListener('change', renderTasks);
renderTasks();