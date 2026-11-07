
import apiRequest from './apiClient.js';

export async function getMeetings() {
  return apiRequest('/meetings');
}

export async function getMeeting(meetingId) {
  return apiRequest(`/meetings/${meetingId}`);
}

export async function createMeeting(meetingData) {
  return apiRequest('/meetings', {
    method: 'POST',
    body: JSON.stringify(meetingData),
  });
}

export async function updateMeeting(meetingId, meetingData) {
  return apiRequest(`/meetings/${meetingId}`, {
    method: 'PUT',
    body: JSON.stringify(meetingData),
  });
}

export async function deleteMeeting(meetingId) {
  return apiRequest(`/meetings/${meetingId}`, {
    method: 'DELETE',
  });
}
