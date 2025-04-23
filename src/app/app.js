// === КОНФИГУРАЦИЯ ===
const API_URL = 'https://680939bb1f1a52874cdc44fb.mockapi.io/:endpoint';

// === ОСНОВНЫЕ ЭЛЕМЕНТЫ ===
const elements = {
  tasksList: document.getElementById('tasks'),
  taskInfoContent: document.querySelector('.task-info-content'),
  // Добавьте остальные элементы по аналогии
};

// === API ФУНКЦИИ ===
async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${await response.text()}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки задач:', error);
    showError('Не удалось загрузить задачи. Проверьте консоль (F12)');
    return [];
  }
}

async function createTask(taskData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return await response.json();
  } catch (error) {
    console.error('Ошибка создания задачи:', error);
    throw error;
  }
}

// === ОСНОВНЫЕ ФУНКЦИИ ===
function showError(message) {
  elements.tasksList.innerHTML = `
    <div class="error">
      <p>${message}</p>
      <button onclick="location.reload()">Обновить</button>
    </div>
  `;
}

async function loadTasks() {
  try {
    const tasks = await fetchTasks();
    if (tasks.length === 0) {
      showMessage('Нет задач. Создайте первую!');
    } else {
      renderTasks(tasks);
    }
  } catch (error) {
    showError('Ошибка загрузки данных');
  }
}

function renderTasks(tasks) {
  elements.tasksList.innerHTML = tasks.map(task => `
    <li data-id="${task.id}">
      <h3>${task.name}</h3>
      <p>${task.description || 'Нет описания'}</p>
      <span class="tags">${task.tags || ''}</span>
    </li>
  `).join('');
}

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
  console.log('Запуск приложения...');
  loadTasks();
  
  // Проверка URL в консоли
  console.log('Используемый URL API:', API_URL);
});