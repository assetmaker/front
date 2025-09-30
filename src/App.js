// frontend/src/App.js
import { useState } from "react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");

  const generateScript = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setCode(data.code);
  };

  return (
    <div>
      <h1>AI Dev Assets Generator</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="프롬프트 입력"
      />
      <button onClick={generateScript}>스크립트 생성</button>

      <pre>{code}</pre>
    </div>
  );
}

export default App;