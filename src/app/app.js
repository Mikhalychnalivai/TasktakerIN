import { fetchTasks, createTask, updateTask, deleteTask } from './mockapi.js';

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM загружен, инициализация приложения...");
  
  // Основные элементы (остается без изменений)
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
    selectedTaskId: null,
    isEditMode: false,
    currentEditTaskId: null,
    currentFilter: null
  };

  // ========== Основные функции ========== //
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
      deleteTask(task.id);
    });
  }

  // Остальные функции (openEditModal, closeModal и т.д.) остаются аналогичными
  // Только заменяем вызовы к БД на функции из mockapi.js

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
      alert('Ошибка сохранения задачи');
    }
  }

  async function deleteTask(taskId) {
    if (!confirm('Удалить эту задачу?')) return;
    
    try {
      await deleteTask(taskId);
      await loadTasks();
      elements.taskInfoContent.innerHTML = `
        <div class="no-task-selected">
          <p>Задача удалена. Выберите другую задачу.</p>
        </div>
      `;
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  }

  // Инициализация
  async function init() {
    setupEventListeners();
    await loadTasks();
    console.log("Приложение инициализировано");
  }

  init();
});