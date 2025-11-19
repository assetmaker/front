import React, { useState, useRef, useEffect } from "react";
import { generatePixelFromText, generatePixelFromImage } from "../api/pixelApi";
import ImageViewer from "../components/ImageViewer";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

const PixelPage = () => {
  const [mode, setMode] = useState("txt2img");

  const [prompt, setPrompt] = useState(""); // 공통/추가 프롬프트
  const [negativePrompt, setNegativePrompt] = useState(""); // 네거티브 프롬프트

  const [imageFile, setImageFile] = useState(null); // img2img용 업로드 파일
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // 업로드 미리보기

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [resultDataUrl, setResultDataUrl] = useState(null); // 최종 base64 이미지
  const [resultMeta, setResultMeta] = useState(null); // filename 등 메타

  const [progress, setProgress] = useState(0); // 진행도
  const progressTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  const startProgress = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    setProgress(0);

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 5;
      });
    }, 300);
  };

  const finishProgress = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setProgress(100);
    setTimeout(() => setProgress(0), 1000);
  };

  const resetProgress = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setProgress(0);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreviewUrl(null);
      return;
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResultDataUrl(null);
    setResultMeta(null);

    if (mode === "txt2img" && !prompt.trim()) {
      setError("프롬프트를 입력하세요.");
      return;
    }

    if (mode === "img2img" && !imageFile) {
      setError("이미지 파일을 업로드하세요.");
      return;
    }

    try {
      setLoading(true);
      startProgress();

      if (mode === "txt2img") {
        const data = await generatePixelFromText(prompt, negativePrompt);
        const { mimeType, imageBase64, filename, subfolder, type } = data;
        const dataUrl = `data:${mimeType || "image/png"};base64,${imageBase64}`;

        setResultDataUrl(dataUrl);
        setResultMeta({ filename, subfolder, type });
      } else {
        // 이미지 → 픽셀
        const base64DataUrl = await fileToBase64(imageFile);
        const data = await generatePixelFromImage(
          base64DataUrl,
          prompt,
          negativePrompt
        );
        const { mimeType, imageBase64, filename, subfolder, type } = data;
        const dataUrl = `data:${mimeType || "image/png"};base64,${imageBase64}`;

        setResultDataUrl(dataUrl);
        setResultMeta({ filename, subfolder, type });
      }

      finishProgress();
    } catch (err) {
      console.error(err);
      resetProgress();
      setError(err.message || "예상치 못한 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "960px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: "1rem" }}>2D 픽셀 에셋 생성 (ComfyUI)</h1>

      {/* 모드 선택 */}
      <div style={{ margin: "1rem 0" }}>
        <button
          type="button"
          onClick={() => setMode("txt2img")}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            marginRight: "0.5rem",
            borderRadius: "6px",
            border:
              mode === "txt2img" ? "2px solid #007bff" : "1px solid #ccc",
            backgroundColor: mode === "txt2img" ? "#e6f0ff" : "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          텍스트 → 픽셀 이미지
        </button>
        <button
          type="button"
          onClick={() => setMode("img2img")}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border:
              mode === "img2img" ? "2px solid #007bff" : "1px solid #ccc",
            backgroundColor: mode === "img2img" ? "#e6f0ff" : "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          이미지 → 픽셀 이미지
        </button>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit}>
        {/* txt2img 모드 */}
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

        {/* img2img 모드 */}
        {mode === "img2img" && (
          <>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              원본 이미지 업로드
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />
            {imagePreviewUrl && (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ marginBottom: "0.5rem" }}>원본 이미지 미리보기</p>
                <ImageViewer
                  src={imagePreviewUrl}
                  alt="업로드한 원본 이미지"
                  maxWidth={256}
                />
              </div>
            )}

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

        {/* 공통 네거티브 프롬프트 */}
        <label
          style={{
            display: "block",
            marginTop: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          (선택) 네거티브 프롬프트
        </label>
        <textarea
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="예: low quality, text, watermark..."
          style={{
            width: "100%",
            minHeight: "60px",
            padding: "0.5rem",
            fontSize: "0.95rem",
          }}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "1rem",
            padding: "0.6rem 1.4rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "생성 중..." : "생성"}
        </button>
      </form>

      {/* 진행도 표시 */}
      {progress > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <div
            style={{
              height: "10px",
              background: "#eee",
              borderRadius: "5px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#007bff",
                transition: "width 0.2s ease-out",
              }}
            />
          </div>
          <p style={{ marginTop: "0.3rem", fontSize: "0.9rem", color: "#555" }}>
            진행도: {progress}%
          </p>
        </div>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          {error}
        </p>
      )}

      {/* 결과 이미지 */}
      {resultDataUrl && (
        <div style={{ marginTop: "2rem" }}>
          <h2>생성된 픽셀 이미지</h2>
          <ImageViewer
            src={resultDataUrl}
            alt="생성된 픽셀 에셋"
            showDownload={true}
            downloadName={
              (resultMeta && resultMeta.filename) || "pixel_asset.png"
            }
          />
          {resultMeta && (
            <p style={{ marginTop: "0.5rem", color: "#555" }}>
              파일명: {resultMeta.filename || "(메모리 상 이미지)"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PixelPage;
