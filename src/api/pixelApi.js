const API_URL = `${import.meta.env.VITE_API_URL}/api/pixel`;

/**
 *
 * @param {string} prompt
 * @param {string} [negativePrompt]
 */
export const generatePixelFromText = async (prompt, negativePrompt = "") => {
  const res = await fetch(`${API_URL}/txt2img`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, negativePrompt }),
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error("txt2img 응답 오류:", msg);
    throw new Error("픽셀 이미지를 생성하지 못했습니다.");
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "픽셀 이미지를 생성하지 못했습니다.");
  }

  return data;
};

/**
 *
 * @param {string} imageBase64
 * @param {string} [prompt]
 * @param {string} [negativePrompt]
 */
export const generatePixelFromImage = async (
  imageBase64,
  prompt = "",
  negativePrompt = ""
) => {
  const res = await fetch(`${API_URL}/img2img`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, prompt, negativePrompt }),
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error("img2img 응답 오류:", msg);
    throw new Error("이미지를 픽셀화하지 못했습니다.");
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "이미지를 픽셀화하지 못했습니다.");
  }

  return data;
};
