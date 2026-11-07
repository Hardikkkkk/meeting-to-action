
import apiRequest from './apiClient.js';

export async function getMeetingTasks(meetingId) {
  return apiRequest(`/meetings/${meetingId}/tasks`);
}

export async function createTask(meetingId, taskData) {
  return apiRequest(`/meetings/${meetingId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

export async function getTask(taskId) {
  return apiRequest(`/tasks/${taskId}`);
}

export async function updateTask(taskId, taskData) {
  return apiRequest(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
}

export async function deleteTask(taskId) {
  return apiRequest(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
}
