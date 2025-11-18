const API_URL = `${import.meta.env.VITE_API_URL}/api/pixel`;

export const generatePixelFromText = async (prompt) => {
  const res = await fetch(`${API_URL}/txt2img`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error("픽셀 이미지를 생성하지 못했습니다.");
  }

  return await res.json();
};

export const generatePixelFromImage = async (image, prompt) => {
  const res = await fetch(`${API_URL}/img2img`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, prompt }),
  });

  if (!res.ok) {
    throw new Error("이미지를 픽셀화하지 못했습니다.");
  }

  return await res.json();
};
