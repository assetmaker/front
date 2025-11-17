import React, { useState } from "react";
import { generatePixelFromText, generatePixelFromImage } from "../api/pixelApi";
import ImageViewer from "../components/ImageViewer";

const buildImageUrl = (imageMeta) => {
  if (!imageMeta) return null;

  const base = import.meta.env.VITE_COMFY_URL; // 예: http://127.0.0.1:8188
  const filename = encodeURIComponent(imageMeta.filename);
  const subfolder = encodeURIComponent(imageMeta.subfolder || "");
  const type = encodeURIComponent(imageMeta.type || "output");

  return `${base}/view?filename=${filename}&subfolder=${subfolder}&type=${type}`;
};

const PixelPage = () => {
  const [mode, setMode] = useState("txt2img"); // "txt2img" | "img2img"
  const [prompt, setPrompt] = useState("");
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultImage, setResultImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResultImage(null);

    if (mode === "txt2img" && !prompt) {
      setError("프롬프트를 입력하세요.");
      return;
    }
    if (mode === "img2img" && !imageName) {
      setError("이미지 파일명을 입력하세요.");
      return;
    }

    try {
      setLoading(true);
      let data;

      if (mode === "txt2img") {
        data = await generatePixelFromText(prompt);
      } else {
        data = await generatePixelFromImage(imageName, prompt);
      }

      if (!data.success || !Array.isArray(data.images) || data.images.length === 0) {
        throw new Error(data.error || "이미지를 생성하지 못했습니다.");
      }

      setResultImage(data.images[0]); // 첫 번째 결과만 사용
    } catch (err) {
      setError(err.message || "예상치 못한 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = resultImage ? buildImageUrl(resultImage) : null;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>2D 픽셀 에셋 생성 (ComfyUI)</h1>

      {/* 모드 선택 */}
      <div style={{ margin: "1rem 0" }}>
        <button
          type="button"
          onClick={() => setMode("txt2img")}
          style={{
            padding: "0.5rem 1rem",
            marginRight: "0.5rem",
            borderRadius: "4px",
            border: mode === "txt2img" ? "2px solid #007bff" : "1px solid #ccc",
            backgroundColor: mode === "txt2img" ? "#e6f0ff" : "#fff",
          }}
        >
          텍스트 → 픽셀 이미지
        </button>
        <button
          type="button"
          onClick={() => setMode("img2img")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            border: mode === "img2img" ? "2px solid #007bff" : "1px solid #ccc",
            backgroundColor: mode === "img2img" ? "#e6f0ff" : "#fff",
          }}
        >
          이미지 → 픽셀 이미지
        </button>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit}>
        {mode === "txt2img" && (
          <>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              텍스트 프롬프트
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: pixel art, young male warrior with sword..."
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "0.5rem",
                fontSize: "1rem",
              }}
              disabled={loading}
            />
          </>
        )}

        {mode === "img2img" && (
          <>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              ComfyUI input 폴더 기준 이미지 파일명
            </label>
            <input
              type="text"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              placeholder="예: knight_source.png"
              style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
              disabled={loading}
            />

            <label
              style={{
                display: "block",
                marginTop: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              (선택) 추가 프롬프트
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: keep character identity, simple pixel shading..."
              style={{
                width: "100%",
                minHeight: "80px",
                padding: "0.5rem",
                fontSize: "1rem",
              }}
              disabled={loading}
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "1rem",
            padding: "0.6rem 1.4rem",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loading ? "생성 중..." : "생성"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          {error}
        </p>
      )}

      {imageUrl && (
        <div style={{ marginTop: "2rem" }}>
          <h2>생성된 픽셀 이미지</h2>
          <ImageViewer src={imageUrl} alt="생성된 픽셀 에셋" />
          <p style={{ marginTop: "0.5rem", color: "#555" }}>
            파일명: {resultImage.filename}
            {resultImage.subfolder && ` (폴더: ${resultImage.subfolder})`}
          </p>
        </div>
      )}
    </div>
  );
};

export default PixelPage;
