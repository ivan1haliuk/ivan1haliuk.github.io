import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabaseUrl = 'https://scyxprgbnomgsjiifkjf.supabase.co';
const supabaseKey = 'sb_publishable_T2YO6jCWGwxr6fmSh1Ye_A_5TOxo4hz';

// Знаходимо список і елементи пошуку.
const status = document.querySelector('#status');
const list = document.querySelector('#projects-list');
const filterForm = document.querySelector('#filter-form');
const searchInput = document.querySelector('#search');
const categoryFilter = document.querySelector('#category-filter');
const sortInput = document.querySelector('#sort');
const filterButton = document.querySelector('#filter-button');
// Знаходимо форму додавання та її поля.
const projectForm = document.querySelector('#project-form');
const titleInput = document.querySelector('#title');
const clientInput = document.querySelector('#client');
const categoryInput = document.querySelector('#category');
const submitButton = document.querySelector('#submit-button');
const formStatus = document.querySelector('#form-status');

// Тут зберігатиметься клієнт бази даних.
let db;

// Завантажуємо фотопроєкти з бази.
async function loadProjects() {
  status.textContent = 'Завантаження фотопроєктів...';
  // Очищаємо попередній список.
  list.replaceChildren();
  filterButton.disabled = true;
  submitButton.disabled = true;

  // Читаємо пошук і вибраний напрям зйомки.
  const search = searchInput.value.trim();
  const category = categoryFilter.value;
  // Визначаємо поле та напрям сортування.
  const sortField = sortInput.value === 'id' ? 'id' : 'title';
  const ascending = sortInput.value !== 'title-desc';

  try {
    // Запитуємо потрібні поля таблиці.
    let query = db
      .from('photo_projects')
      .select('id, title, client, category');

    // Шукаємо частину назви без урахування регістру.
    if (search.length > 0) {
      query = query.ilike('title', '%' + search + '%');
    }

    // Залишаємо лише вибраний напрям зйомки.
    if (category !== '') {
      query = query.eq('category', category);
    }

    // Очікуємо відсортовані дані або помилку.
    const { data, error } = await query.order(sortField, { ascending });

    if (error) {
      // Повідомляємо про невдале завантаження.
      console.error('Помилка завантаження:', error);
      status.textContent = 'Не вдалося завантажити фотопроєкти. Перевірте підключення та налаштування доступу до таблиці.';
      return false;
    }

    // Окреме повідомлення, якщо список порожній.
    if (data.length === 0) {
      status.textContent = search !== '' || category !== ''
        ? 'За заданими умовами фотопроєктів не знайдено.'
        : 'Каталог поки порожній.';
      return true;
    }

    // Для кожного проєкту створюємо елемент списку.
    for (const project of data) {
      const item = document.createElement('li');
      // Виводимо дані звичайним текстом.
      item.textContent = `${project.title} — ${project.client} (${project.category})`;
      list.append(item);
    }

    // Показуємо кількість знайдених записів.
    status.textContent = `Знайдено фотопроєктів: ${data.length}`;
    return true;
  } catch (error) {
    console.error('Помилка запиту:', error);
    status.textContent = 'Не вдалося виконати запит. Перевірте інтернет-з’єднання та повторіть спробу.';
    return false;
  } finally {
    filterButton.disabled = false;
    submitButton.disabled = false;
  }
}

// Застосовуємо пошук, фільтр і сортування.
filterForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await loadProjects();
});

// Обробляємо додавання нового проєкту.
projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Забираємо зайві пробіли по краях.
  const title = titleInput.value.trim();
  const client = clientInput.value.trim();
  const category = categoryInput.value;

  // Перевіряємо довжину тексту й напрям зйомки.
  if (
    title.length === 0 || title.length > 150 ||
    client.length === 0 || client.length > 150 ||
    (category !== 'Портретна зйомка' && category !== 'Зйомка подій' && category !== 'Комерційна зйомка')
  ) {
    formStatus.textContent = 'Введіть назву й замовника від 1 до 150 символів та оберіть напрям зйомки.';
    return;
  }

  submitButton.disabled = true;
  filterButton.disabled = true;
  // Кнопки заблоковані на час запиту.
  formStatus.textContent = 'Додавання фотопроєкту...';

  try {
    // Передаємо новий запис до таблиці.
    const { error } = await db
      .from('photo_projects')
      .insert({ title, client, category });

    if (error) {
      // При помилці введені дані залишаються у формі.
      console.error('Помилка додавання:', error);
      formStatus.textContent = 'Не вдалося додати фотопроєкт. Перевірте з’єднання та право додавання записів.';
      return;
    }

    // Після успіху очищаємо форму.
    projectForm.reset();
    formStatus.textContent = 'Фотопроєкт успішно додано.';
    // Оновлюємо список без перезавантаження сторінки.
    const loaded = await loadProjects();

    // Запис міг зберегтися, навіть якщо список не оновився.
    if (!loaded) {
      formStatus.textContent = 'Фотопроєкт збережено, але список не оновився. Повторіть завантаження списку.';
    }
  } catch (error) {
    console.error('Помилка запиту:', error);
    formStatus.textContent = 'Не вдалося виконати запит. Перевірте інтернет-з’єднання та повторіть спробу.';
  } finally {
    // Знову дозволяємо натискати кнопки.
    submitButton.disabled = false;
    filterButton.disabled = false;
  }
});

// Створюємо клієнт і завантажуємо початковий список.
if (supabaseKey.startsWith('sb_publishable_')) {
  db = createClient(supabaseUrl, supabaseKey);
  loadProjects();
} else {
  status.textContent = 'Підключення ще не налаштоване: потрібно вказати Publishable key Supabase у js/app.js.';
}
