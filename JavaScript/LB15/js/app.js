import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const db = createClient(
  'https://scyxprgbnomgsjiifkjf.supabase.co',
  'sb_publishable_T2YO6jCWGwxr6fmSh1Ye_A_5TOxo4hz'
);
const $ = (selector) => document.querySelector(selector);
const authStatus = $('#auth-status');
const authForms = $('#auth-forms');
const userPanel = $('#user-panel');
const userInfo = $('#user-info');
const status = $('#status');
const list = $('#projects-list');
const adminPanel = $('#admin-panel');
const formStatus = $('#form-status');
const projectForm = $('#project-form');
const projectIdInput = $('#project-id');
const titleInput = $('#title');
const clientInput = $('#client');
const categoryInput = $('#category');
const saveButton = $('#save-button');
const cancelButton = $('#cancel-button');
let isAdmin = false;
let projects = [];
let busy = false;

// Блокуємо керування на час запиту.
function setBusy(value) {
  busy = value;
  const controls = document.querySelectorAll('button, input, select');
  for (const control of controls) control.disabled = value;
}

function resetProjectForm() {
  projectForm.reset();
  projectIdInput.value = '';
  saveButton.textContent = 'Додати фотопроєкт';
  cancelButton.hidden = true;
}

function setAdminState(value) {
  isAdmin = value;
  adminPanel.hidden = !value;
  if (!value) resetProjectForm();
}

// Кнопки змін доступні лише адміністратору.
function showProjects() {
  list.replaceChildren();
  if (projects.length === 0) {
    status.textContent = $('#search').value.trim() || $('#category-filter').value
      ? 'За заданими умовами фотопроєктів не знайдено.'
      : 'Каталог поки порожній.';
    return;
  }
  for (const project of projects) {
    const item = document.createElement('li');
    const description = document.createElement('span');
    description.textContent = `${project.title} — ${project.client} (${project.category})`;
    item.append(description);
    if (isAdmin) {
      const actions = document.createElement('div');
      actions.className = 'project-actions';
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.textContent = 'Редагувати';
      editButton.addEventListener('click', () => startEditing(project));
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Видалити';
      deleteButton.addEventListener('click', () => deleteProject(project.id));
      actions.append(editButton, deleteButton);
      item.append(actions);
    }
    list.append(item);
  }
  status.textContent = `Знайдено фотопроєктів: ${projects.length}`;
}

// Читання з пошуком, фільтром і сортуванням.
async function loadProjects() {
  status.textContent = 'Завантаження фотопроєктів...';
  list.replaceChildren();
  try {
    let query = db.from('photo_projects').select('id, title, client, category');
    const search = $('#search').value.trim();
    const category = $('#category-filter').value;
    const sort = $('#sort').value;
    if (search) query = query.ilike('title', '%' + search + '%');
    if (category) query = query.eq('category', category);
    const { data, error } = await query.order(sort === 'id' ? 'id' : 'title', {
      ascending: sort !== 'title-desc'
    });
    if (error) throw error;
    projects = data ?? [];
    showProjects();
  } catch (error) {
    console.error('Помилка читання:', error);
    projects = [];
    status.textContent = 'Не вдалося завантажити фотопроєкти. Перевірте з’єднання та доступ до таблиці.';
  }
}

// Перевіряємо користувача та його роль через RPC.
async function updateAuthState() {
  setAdminState(false);
  formStatus.textContent = '';
  userPanel.hidden = true;
  authForms.hidden = true;
  userInfo.textContent = '';
  try {
    const { data, error } = await db.auth.getUser();
    if (error || !data.user) {
      authForms.hidden = false;
      authStatus.textContent = 'Вхід не виконано.';
      return;
    }
    userInfo.textContent = `Користувач: ${data.user.email}`;
    userPanel.hidden = false;
    try {
      const { data: result, error: roleError } = await db.rpc('check_admin');
      if (roleError) throw roleError;
      setAdminState(result === true);
      authStatus.textContent = isAdmin
        ? 'Виконано вхід адміністратора.'
        : 'Виконано вхід звичайного користувача.';
    } catch (roleError) {
      console.error('Помилка перевірки ролі:', roleError);
      authStatus.textContent = 'Вхід виконано, але роль не вдалося перевірити.';
    }
  } catch (error) {
    console.error('Помилка автентифікації:', error);
    authForms.hidden = false;
    authStatus.textContent = 'Не вдалося перевірити сеанс.';
  } finally {
    await loadProjects();
  }
}

$('#register-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy) return;
  const form = event.currentTarget;
  setBusy(true);
  authStatus.textContent = 'Реєстрація...';
  try {
    const { data, error } = await db.auth.signUp({
      email: $('#register-email').value.trim(),
      password: $('#register-password').value
    });
    if (error) throw error;
    form.reset();
    if (data.session) {
      await updateAuthState();
    } else {
      authStatus.textContent = 'Перевірте електронну пошту для підтвердження реєстрації.';
    }
  } catch (error) {
    console.error('Помилка реєстрації:', error);
    authStatus.textContent = 'Не вдалося зареєструвати користувача.';
  } finally {
    setBusy(false);
  }
});

$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy) return;
  const form = event.currentTarget;
  setBusy(true);
  authStatus.textContent = 'Виконується вхід...';
  try {
    const { error } = await db.auth.signInWithPassword({
      email: $('#login-email').value.trim(),
      password: $('#login-password').value
    });
    if (error) throw error;
    form.reset();
    await updateAuthState();
  } catch (error) {
    console.error('Помилка входу:', error);
    authStatus.textContent = 'Не вдалося виконати вхід. Перевірте електронну адресу та пароль.';
  } finally {
    setBusy(false);
  }
});

$('#logout-button').addEventListener('click', async () => {
  if (busy) return;
  setBusy(true);
  try {
    const { error } = await db.auth.signOut();
    if (error) throw error;
    await updateAuthState();
  } catch (error) {
    console.error('Помилка виходу:', error);
    authStatus.textContent = 'Не вдалося завершити сеанс.';
  } finally {
    setBusy(false);
  }
});

function startEditing(project) {
  if (!isAdmin || busy) return;
  projectIdInput.value = String(project.id);
  titleInput.value = project.title;
  clientInput.value = project.client;
  categoryInput.value = project.category;
  saveButton.textContent = 'Зберегти зміни';
  cancelButton.hidden = false;
  formStatus.textContent = `Редагування фотопроєкту № ${project.id}`;
}

cancelButton.addEventListener('click', () => {
  resetProjectForm();
  formStatus.textContent = '';
});

// Додаємо запис або змінюємо вибраний за id.
projectForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isAdmin || busy) return;
  const title = titleInput.value.trim();
  const client = clientInput.value.trim();
  const category = categoryInput.value;
  const projectId = projectIdInput.value;
  if (!title || !client || title.length > 150 || client.length > 150 ||
      (category !== 'Портретна зйомка' && category !== 'Зйомка подій' && category !== 'Комерційна зйомка')) {
    formStatus.textContent = 'Перевірте назву, замовника та напрям зйомки.';
    return;
  }
  setBusy(true);
  formStatus.textContent = 'Збереження запису...';
  try {
    const query = projectId
      ? db.from('photo_projects').update({ title, client, category }).eq('id', Number(projectId))
      : db.from('photo_projects').insert({ title, client, category });
    const { error } = await query;
    if (error) throw error;
    resetProjectForm();
    await loadProjects();
    formStatus.textContent = projectId ? 'Зміни збережено.' : 'Фотопроєкт додано.';
  } catch (error) {
    console.error('Помилка збереження:', error);
    formStatus.textContent = 'Не вдалося зберегти запис. Перевірте з’єднання та права доступу.';
  } finally {
    setBusy(false);
  }
});

async function deleteProject(projectId) {
  if (!isAdmin || busy || !confirm('Видалити вибраний фотопроєкт?')) return;
  setBusy(true);
  formStatus.textContent = 'Видалення фотопроєкту...';
  try {
    const { error } = await db.from('photo_projects').delete().eq('id', projectId);
    if (error) throw error;
    if (projectIdInput.value === String(projectId)) resetProjectForm();
    await loadProjects();
    formStatus.textContent = 'Фотопроєкт видалено.';
  } catch (error) {
    console.error('Помилка видалення:', error);
    formStatus.textContent = 'Не вдалося видалити фотопроєкт.';
  } finally {
    setBusy(false);
  }
}

$('#filter-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy) return;
  setBusy(true);
  try {
    await loadProjects();
  } finally {
    setBusy(false);
  }
});

setBusy(true);
await updateAuthState();
setBusy(false);
