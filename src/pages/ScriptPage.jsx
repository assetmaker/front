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
      setError('Please enter a prompt.');
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
        setError(data.error || 'Failed to generate script.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Generate a Script</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to generate a script..."
          style={{ width: '100%', minHeight: '100px', padding: '0.5rem', fontSize: '1rem' }}
        />
        <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {code && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Generated Code</h2>
          <CodeEditor code={code} />
        </div>
      )}
    </div>
  );
};

export default ScriptPage;
