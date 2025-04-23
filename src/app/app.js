// Конфигурация API (ЗАМЕНИТЕ НА ВАШ URL ИЗ mockapi.io!)
const API_URL = 'https://680939bb1f1a52874cdc44fb.mockapi.io/tasks/';

// Основные элементы
const elements = {
    taskListBtn: document.getElementById('taskListBtn'),
    taskPanel: document.getElementById('taskPanel'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    tasksList: document.getElementById('tasks'),
    // ... остальные элементы ...
};

// Состояние приложения
const state = {
    tasks: [],
    selectedTaskId: null
};

// ========== API Функции ==========
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
        showError('Не удалось загрузить задачи. Попробуйте позже.');
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