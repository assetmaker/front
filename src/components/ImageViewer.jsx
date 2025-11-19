import React from "react";

const ImageViewer = ({
  src,
  alt,
  maxWidth = 512,
  showDownload = false,
  downloadName = "pixel_asset.png",
}) => {
  if (!src) return null;

  const computedMaxWidth =
    typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;

  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = src; // data:image/png;base64,...
      link.download = downloadName || "pixel_asset.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("이미지 다운로드 실패:", e);
      alert("이미지 다운로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      style={{
        margin: "1rem 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          maxWidth: computedMaxWidth,
          width: "100%",
          height: "auto",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      />
      {showDownload && (
        <button
          type="button"
          onClick={handleDownload}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "6px",
            border: "1px solid #007bff",
            backgroundColor: "#fff",
            color: "#007bff",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          이미지 다운로드
        </button>
      )}
    </div>
  );
};

export default ImageViewer;
