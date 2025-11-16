const API_URL = `${import.meta.env.VITE_API_URL}/api/model`;

export const createModelPreviewTask = async (prompt) => {
  const res = await fetch(`${API_URL}/create-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return res.json();
};

export const getTaskStatus = async (taskId) => {
  const res = await fetch(`${API_URL}/task-status/${taskId}`);
  return res.json();
};

export const createModelRefineTask = async (previewTaskId) => {
  const res = await fetch(`${API_URL}/create-refine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ previewTaskId }),
  });
  return res.json();
};