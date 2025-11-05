import React, { useState } from 'react';
import { generateScript } from '../api/scriptApi';
import CodeEditor from '../components/CodeEditor';

const ScriptPage = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [code, setCode] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) {
      setError('프롬프트를 입력하세요.');
      return;
    }
    setLoading(true);
    setError(null);
    setCode(null);

    try {
      const data = await generateScript(prompt);
      if (data.success) {
        setCode(data.code);
      } else {
        setError(data.error || '스크립트를 생성하지 못했습니다.');
      }
    } catch (err) {
      setError(err.message || '예상치 못한 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>스크립트 생성</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="스크립트를 생성하기 위한 프롬프트를 입력하세요..."
          style={{ width: '100%', minHeight: '100px', padding: '0.5rem', fontSize: '1rem' }}
        />
        <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? '생성 중...' : '생성'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {code && (
        <div style={{ marginTop: '2rem' }}>
          <h2>생성된 코드</h2>
          <CodeEditor code={code} />
        </div>
      )}
    </div>
  );
};

export default ScriptPage;
