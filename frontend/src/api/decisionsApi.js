
import apiRequest from './apiClient.js';

export async function getMeetingDecisions(meetingId) {
  return apiRequest(`/meetings/${meetingId}/decisions`);
}

export async function createDecision(meetingId, content) {
  return apiRequest(`/meetings/${meetingId}/decisions`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function updateDecision(decisionId, content) {
  return apiRequest(`/decisions/${decisionId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}

export async function deleteDecision(decisionId) {
  return apiRequest(`/decisions/${decisionId}`, {
    method: 'DELETE',
  });
}
