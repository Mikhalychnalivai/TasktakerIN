const API_URL = 'https://680939bb1f1a52874cdc44fb.mockapi.io/tasks';

const elements = {
    taskListBtn: document.getElementById('taskListBtn'),
    taskPanel: document.getElementById('taskPanel'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    modalOverlay: document.getElementById('modalOverlay'),
    createTaskBtn: document.getElementById('createTaskBtn'),
    cancelTaskBtn: document.getElementById('cancelTaskBtn'),
    newTaskName: document.getElementById('newTaskName'),
    taskDescription: document.getElementById('taskDescription'),
    taskFile: document.getElementById('taskFile'),
    taskTags: document.getElementById('taskTags'),
    tasksList: document.getElementById('tasks'),
    taskInfoContent: document.querySelector('.task-info-content'),
    tagsCloud: document.getElementById('tagsCloud'),
    fileViewerModal: document.getElementById('fileViewerModal'),
    fileViewerFrame: document.getElementById('fileViewerFrame'),
    downloadFileBtn: document.getElementById('downloadFileBtn'),
    closeFileBtn: document.getElementById('closeFileBtn'),
    closeFileViewer: document.querySelector('.close-file-viewer'),
    resetFilterBtn: document.getElementById('resetFilterBtn')
};


// Состояние приложения
const state = {
    tasks: [],
    selectedTaskId: null
};

// ========== API Функции ==========
async function fetchTasks() {
  try {
    console.log('Запрос к:', API_URL); // Для отладки
    
    const response = await fetch(API_URL, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('Ответ сервера:', response); // Для отладки
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Получено задач:', data.length);
    return data;
    
  } catch (error) {
    console.error('Ошибка fetchTasks:', {
      message: error.message,
      url: API_URL,
      time: new Date().toISOString()
    });
    showError('Сервер не отвечает. Попробуйте позже');
    return [];
  }
}

async function createTask(taskData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        return await response.json();
    } catch (error) {
        console.error('Ошибка создания задачи:', error);
        throw error;
    }
}

// ========== Основные функции ==========
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
        <p>${message}</p>
        <button onclick="window.location.reload()">Обновить</button>
    `;
    elements.tasksList.appendChild(errorElement);
}

async function loadTasks() {
    try {
        state.tasks = await fetchTasks();
        if (state.tasks.length === 0) {
            showMessage('Нет задач. Создайте первую!');
        } else {
            renderTasks();
        }
    } catch (error) {
        showError('Ошибка загрузки данных');
    }
}

function renderTasks() {
    elements.tasksList.innerHTML = state.tasks.map(task => `
        <li data-id="${task.id}">
            <h3>${task.name}</h3>
            <p>${task.description || 'Нет описания'}</p>
            <span class="tags">${task.tags || ''}</span>
        </li>
    `).join('');
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('Приложение инициализировано');
    loadTasks();
    
    // Для отладки
    console.log('Используемый URL API:', API_URL);
});