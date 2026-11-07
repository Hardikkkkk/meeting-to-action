// Dummy data shaped like the future Flask API responses.
export const people = [
  { id: 1, name: 'Priya Sharma', role: 'Product Designer' },
  { id: 2, name: 'Rahul Mehta', role: 'Product Manager' },
  { id: 3, name: 'Anita Rao', role: 'Client Success' },
];

export const sampleTranscript = `Priya: I'll send the updated design by tomorrow.
Rahul: Sounds good. Also, let's finalize the budget by next Friday. Anita, can you check with the client?
Anita: Sure, I'll do that by Wednesday. We also need to decide on the launch date.
Priya: Let's pick the date once the client replies.`;

export const seedMeetings = [
  { id: 1, title: 'Weekly Sync', date: '2026-10-15', summary: 'Reviewed sprint progress and agreed on the next release scope.', decisions: ['Freeze the release scope', 'Hold demos every second Friday'], questions: ['Who will own testing?'] },
];

export const seedTasks = [
  { id: 1, meetingId: 1, task: 'Prepare sprint report', ownerId: 2, due: '2026-10-20', priority: 'Medium', status: 'Done' },
  { id: 2, meetingId: 1, task: 'Update user flow diagrams', ownerId: 1, due: '2026-10-26', priority: 'Low', status: 'In Progress' },
];

// Later: replace the body with fetch('/api/extract', { method: 'POST', body: ... }).
// For now it waits 1.5s and returns a fixed sample result.
export function extractNotes(text) {
  return new Promise((resolve) =>
    setTimeout(() => resolve({
      summary: 'The team discussed the design update, budget, launch date and client feedback. Next steps include finalizing the design, confirming the budget and checking with the client.',
      decisions: ['Send the updated design by tomorrow', 'Finalize the budget by next Friday', 'Pick the launch date after the client replies'],
      questions: ['What is the final launch date?', 'Is there any additional client feedback?'],
      mapped: [{ spoken: 'Priya', ownerId: 1 }, { spoken: 'Rahul', ownerId: 2 }, { spoken: 'Anita', ownerId: 3 }],
      actions: [
        { task: 'Send updated design', ownerId: 1, due: '2026-10-23', priority: 'High', status: 'Todo' },
        { task: 'Finalize budget', ownerId: 2, due: '2026-10-30', priority: 'Medium', status: 'Todo' },
        { task: 'Check with client', ownerId: 3, due: '2026-10-28', priority: 'Medium', status: 'Todo' },
      ],
    }), 1500)
  );
}
