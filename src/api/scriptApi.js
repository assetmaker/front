export const generateScript = async (prompt) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/script`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return await res.json();
};