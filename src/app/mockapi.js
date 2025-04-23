const API_URL = 'https://6809296d1f1a52874cdc1301.mockapi.io/tasktaker/:endpoint';

export async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Ошибка сети');
    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки задач:', error);
    return [];
  }
}

export async function createTask(taskData) {
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

export async function updateTask(id, taskData) {
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

export async function deleteTask(id) {
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