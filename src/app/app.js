const API_URL = 'https://6809296d1f1a52874cdc1301.mockapi.io/tasktaker/:endpoint';

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

const state = {
    tasks: [],
    selectedTaskId: null,
    isEditMode: false,
    currentEditTaskId: null,
    currentFilter: null
};

//  API Функции  //

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка сети');
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
        alert('Не удалось загрузить задачи');
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

async function updateTask(id, taskData) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        return await response.json();
    } catch (error) {
        console.error('Ошибка обновления задачи:', error);
        throw error;
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error('Ошибка удаления задачи:', error);
        throw error;
    }
}

// Основные функции //
function toggleTaskPanel() {
    elements.taskPanel.classList.toggle('show');
}

function openCreateModal() {
    state.isEditMode = false;
    state.currentEditTaskId = null;
    resetModalForm();
    elements.createTaskBtn.textContent = 'Создать';
    elements.modalOverlay.style.display = 'flex';
    elements.newTaskName.focus();
}

function openEditModal(taskId) {
    const task = state.tasks.find(t => t.id == taskId);
    if (!task) return;

    state.isEditMode = true;
    state.currentEditTaskId = taskId;
    
    elements.newTaskName.value = task.name;
    elements.taskDescription.value = task.description || '';
    elements.taskTags.value = task.tags || '';
    elements.createTaskBtn.textContent = 'Сохранить';
    
    elements.modalOverlay.style.display = 'flex';
    elements.newTaskName.focus();
}

function closeModal() {
    elements.modalOverlay.style.display = 'none';
    resetModalForm();
}

function resetModalForm() {
    elements.newTaskName.value = '';
    elements.taskDescription.value = '';
    elements.taskFile.value = '';
    elements.taskTags.value = '';
}

function closeFileViewer() {
    elements.fileViewerModal.style.display = 'none';
    elements.fileViewerFrame.src = '';
}

async function loadTasks() {
    state.tasks = await fetchTasks();
    renderTasks();
    renderTagsCloud();
}

function renderTasks() {
    elements.tasksList.innerHTML = "";
    
    const tasksToRender = state.currentFilter 
        ? state.tasks.filter(task => 
            task.tags && task.tags.split(',').map(t => t.trim()).includes(state.currentFilter))
        : state.tasks;
    
    tasksToRender.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="task-name-container">
                <span class="task-name ${task.completed ? 'completed' : ''}">${task.name}</span>
            </div>
            ${task.tags ? `<div class="task-tags">${
                task.tags.split(',').map(tag => 
                    `<span class="task-tag">${tag.trim()}</span>`).join('')
            }</div>` : ''}
        `;
        
        li.addEventListener("click", () => selectTask(task.id));
        elements.tasksList.appendChild(li);
    });
}

function selectTask(taskId) {
    state.selectedTaskId = taskId;
    showTaskDetails(taskId);
}

function showTaskDetails(taskId) {
    const task = state.tasks.find(t => t.id == taskId);
    if (!task) return;

    elements.taskInfoContent.innerHTML = `
        <div class="task-header">
            <h3 class="task-title">${task.name}</h3>
            <div class="task-actions">
                <button class="edit-task-btn" data-task-id="${task.id}">Изменить</button>
                <button class="delete-task-btn" data-task-id="${task.id}">Удалить</button>
            </div>
        </div>
        <div class="task-description">
            <h4>Описание:</h4>
            <div class="description-text">${task.description || "Описание отсутствует"}</div>
        </div>
    `;

    document.querySelector('.edit-task-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(task.id);
    });

    document.querySelector('.delete-task-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTaskHandler(task.id);
    });
}

function renderTagsCloud() {
    const allTags = [...new Set(
        state.tasks.flatMap(task => 
            task.tags ? task.tags.split(',').map(t => t.trim()).filter(t => t) : []
        )
    )];
    
    elements.tagsCloud.innerHTML = allTags.map(tag => 
        `<span class="tag-filter ${state.currentFilter === tag ? 'active' : ''}" data-tag="${tag}">${tag}</span>`
    ).join('');
    
    document.querySelectorAll('.tag-filter').forEach(tag => {
        tag.addEventListener('click', () => {
            const selectedTag = tag.getAttribute('data-tag');
            state.currentFilter = state.currentFilter === selectedTag ? null : selectedTag;
            renderTagsCloud();
            renderTasks();
        });
    });
}

async function handleTaskSubmit() {
    const name = elements.newTaskName.value.trim();
    const description = elements.taskDescription.value.trim();
    const tags = elements.taskTags.value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '').join(',');

    if (!name) {
        alert('Название задачи обязательно');
        return;
    }

    const taskData = { name, description, tags, completed: false };

    try {
        if (state.isEditMode && state.currentEditTaskId) {
            await updateTask(state.currentEditTaskId, taskData);
        } else {
            await createTask(taskData);
        }
        await loadTasks();
        closeModal();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка сохранения задачи: ' + error.message);
    }
}

async function deleteTaskHandler(taskId) {
    if (!confirm('Удалить эту задачу?')) return;
    
    try {
        const success = await deleteTask(taskId);
        if (success) {
            await loadTasks();
            elements.taskInfoContent.innerHTML = `
                <div class="no-task-selected">
                    <p>Выберите задачу из списка</p>
                </div>
            `;
            state.selectedTaskId = null;
        }
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Не удалось удалить задачу');
    }
}

function handleOverlayClick(e) {
    if (e.target === elements.modalOverlay) {
        closeModal();
    }
}

function handleFileViewerClick(e) {
    if (e.target === elements.fileViewerModal) {
        closeFileViewer();
    }
}

function resetFilter() {
    state.currentFilter = null;
    renderTagsCloud();
    renderTasks();
}

// Настройка обработчиков событий //
function setupEventListeners() {
    elements.taskListBtn.addEventListener('click', toggleTaskPanel);
    elements.addTaskBtn.addEventListener('click', openCreateModal);
    elements.cancelTaskBtn.addEventListener('click', closeModal);
    elements.createTaskBtn.addEventListener('click', handleTaskSubmit);
    elements.modalOverlay.addEventListener('click', handleOverlayClick);
    elements.closeFileBtn.addEventListener('click', closeFileViewer);
    elements.closeFileViewer.addEventListener('click', closeFileViewer);
    elements.fileViewerModal.addEventListener('click', handleFileViewerClick);
    elements.resetFilterBtn.addEventListener('click', resetFilter);
}

// Инициализация приложения //
async function init() {
    setupEventListeners();
    await loadTasks();
    console.log("Приложение инициализировано");
}

// Запуск приложения //
document.addEventListener('DOMContentLoaded', init);