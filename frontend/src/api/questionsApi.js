
import apiRequest from './apiClient.js';

export async function getMeetingQuestions(meetingId) {
  return apiRequest(`/meetings/${meetingId}/questions`);
}

export async function createQuestion(meetingId, content) {
  return apiRequest(`/meetings/${meetingId}/questions`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function updateQuestion(questionId, updates) {
  return apiRequest(`/questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteQuestion(questionId) {
  return apiRequest(`/questions/${questionId}`, {
    method: 'DELETE',
  });
}
