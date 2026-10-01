// Створюємо об'єкт книги
let book = {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    year: 1997,
    isRead: true
};
// Метод для виведення інформації про книгу
book.bookInfo = function() {
    console.log(`Назва: ${this.title}, Автор: ${this.author}, Рік видання: ${this.year}, Прочитана: ${this.isRead ? "Так" : "Ні"}`);
};

book.bookInfo();

// Змінюємо статус прочитання книги
book.isRead = !book.isRead;
book.bookInfo();
// Створюємо масив книг бібліотеки
let library = [
    { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", year: 1997, isRead: true },
    { title: "The Hobbit", author: "J.R.R. Tolkien", year: 1937, isRead: false },
    { title: "1984", author: "George Orwell", year: 1949, isRead: true }
];
// Функція для виведення списку книг
function displayLibrary() {
    console.log("Список книг:");
    library.forEach(book => {
        console.log(`Назва: ${book.title}, Автор: ${book.author}, Рік видання: ${book.year}, Прочитана: ${book.isRead ? "Так" : "Ні"}`);
    });
}
// Додаємо нову книгу до бібліотеки
library.push({ title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925, isRead: false });

displayLibrary();

// Сортуємо книги за роком видання
library.sort((a, b) => a.year - b.year);
console.log("Відсортовані книги за роком видання:", library);
// Отримуємо список непрочитаних книг
let unreadBooks = library.filter(book => !book.isRead);
console.log("Непрочитані книги:", unreadBooks);
// Шукаємо книгу за автором
let tolkienBook = library.find(book => book.author === "J.R.R. Tolkien");
console.log("Книга Толкіна:", tolkienBook);
// Додаємо кожній книзі метод для зміни статусу на прочитану
library.forEach(b => {
    b.markAsRead = function() {
        this.isRead = true;
    };
});
// Функція для обчислення середнього року видання книг
function calculateAverageYear() {
    let sum = 0;
    library.forEach(b => sum += b.year);
    return Math.round(sum / library.length);
}
console.log("Середній рік видання:", calculateAverageYear());
// Обробляємо натискання кнопки додавання книги
document.getElementById('btn-book').addEventListener('click', () => {
    let title = prompt("Введіть назву книги:");
    let author = prompt("Введіть автора книги:");
    let year = +prompt("Введіть рік видання книги:");
    let isRead = confirm("Чи прочитана книга?");
    // Додаємо введену користувачем книгу
    library.push({ title, author, year, isRead });
    displayLibrary();
});
// Створюємо масив фільмів
let movies = [
    { title: "Inception", director: "Christopher Nolan", year: 2010, genre: "Sci-Fi", isWatched: true },
    { title: "Interstellar", director: "Christopher Nolan", year: 2014, genre: "Sci-Fi", isWatched: false },
    { title: "The Matrix", director: "Lana Wachowski", year: 1999, genre: "Action", isWatched: true }
];
// Функція для виведення інформації про фільми
function displayMovies() {
    console.log("Ваша фільмотека:");

    movies.forEach(m => {
        console.log(`Фільм: ${m.title}, Режисер: ${m.director}, Рік: ${m.year}, Жанр: ${m.genre}, Переглянуто: ${m.isWatched ? "Так" : "Ні"}`);
    });
}
// Обробляємо додавання нового фільму
document.getElementById('btn-movie').addEventListener('click', () => {
    let title = prompt("Назва фільму:");
    let director = prompt("Режисер:");
    let year = +prompt("Рік виходу:");
    let genre = prompt("Жанр:");
    let isWatched = confirm("Чи переглянуто?");
    // Додаємо новий фільм до фільмотеки
    movies.push({ title, director, year, genre, isWatched });
    displayMovies();
});
// Виводимо всі фільми після натискання кнопки
document.getElementById('btn-show').addEventListener('click', displayMovies);