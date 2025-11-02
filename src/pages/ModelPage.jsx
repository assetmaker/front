import React, { useState, useEffect } from 'react';
import {
  createModelPreviewTask,
  getTaskStatus,
  createModelRefineTask,
} from '../api/modelApi';
import ImageViewer from '../components/ImageViewer';

const ModelPage = () => {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState(null);
  const [modelData, setModelData] = useState(null);

  // State for multi-step progress
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [pollingTaskId, setPollingTaskId] = useState(null);
  const [isRefine, setIsRefine] = useState(false);

  // Polling effect
  useEffect(() => {
    if (!pollingTaskId) return;

    const interval = setInterval(async () => {
      try {
        const res = await getTaskStatus(pollingTaskId);
        if (!res.success) {
          throw new Error(res.error || 'Could not get task status.');
        }

        const task = res.data;
        setProgress(task.progress || 0);

        if (task.status === 'SUCCEEDED') {
          clearInterval(interval);
          setPollingTaskId(null);
          setProgress(100);

          if (isRefine) {
            // This was the refine task, we are done
            setStatusMessage('Model generated successfully!');
            setModelData(task);
          } else {
            // This was the preview task, start the refine task
            setStatusMessage('Preview complete. Creating final model...');
            const refineRes = await createModelRefineTask(task.id);
            if (!refineRes.success) {
              throw new Error(refineRes.error || 'Could not create refine task.');
            }
            setIsRefine(true);
            setPollingTaskId(refineRes.data.result);
          }
        } else if (task.status === 'FAILED') {
          throw new Error(task.error_message || 'Task failed during generation.');
        }
        // If still PENDING or IN_PROGRESS, the status message is already set
        // and the loop will continue.

      } catch (err) {
        clearInterval(interval);
        setError(err.message);
        setStatusMessage('An error occurred.');
        setPollingTaskId(null);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [pollingTaskId, isRefine]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    // Reset state
    setError(null);
    setModelData(null);
    setProgress(0);
    setIsRefine(false);
    setPollingTaskId(null);

    try {
      setStatusMessage('Creating preview task...');
      const res = await createModelPreviewTask(prompt);
      if (!res.success || !res.data.result) {
        throw new Error(res.error || 'Could not create preview task.');
      }
      setStatusMessage('Generating preview model... (this may take a minute)');
      setPollingTaskId(res.data.result);
    } catch (err) {
      setError(err.message);
      setStatusMessage('An error occurred.');
    }
  };

  const isGenerating = !!pollingTaskId;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Generate a 3D Model</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to generate a 3D model..."
          style={{ width: '100%', minHeight: '100px', padding: '0.5rem', fontSize: '1rem' }}
          disabled={isGenerating}
        />
        <button type="submit" disabled={isGenerating} style={{ marginTop: '1rem' }}>
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {isGenerating && (
        <div style={{ marginTop: '1rem' }}>
          <p>{statusMessage}</p>
          <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '20px',
                backgroundColor: '#007bff',
                borderRadius: '4px',
                transition: 'width 0.3s ease-in-out',
              }}
            />
          </div>
        </div>
      )}

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {modelData && (() => {
        const getModelUrl = (data) => {
          if (!data) return null;

          // Case 1: data.model_urls is an object of URLs { glb: "...", fbx: "..." }
          if (data.model_urls) {
            if (typeof data.model_urls.glb === 'string') return data.model_urls.glb;
            if (typeof data.model_urls.gltf === 'string') return data.model_urls.gltf;

            const modelFile = Object.values(data.model_urls).find(
              (url) => typeof url === 'string' && (url.endsWith('.glb') || url.endsWith('.gltf'))
            );
            if (modelFile) return modelFile;
          }

          // Case 2: data.model_outputs is an array of objects [ { format: "glb", url: "..." } ]
          if (Array.isArray(data.model_outputs)) {
            const glbOutput = data.model_outputs.find(o => o.format === 'glb');
            if (glbOutput && typeof glbOutput.url === 'string') return glbOutput.url;

            const gltfOutput = data.model_outputs.find(o => o.format === 'gltf');
            if (gltfOutput && typeof gltfOutput.url === 'string') return gltfOutput.url;
          }

          return null;
        };
        const modelUrl = getModelUrl(modelData);

        const getModelExtension = (url) => {
          if (!url) return '.glb';
          if (url.endsWith('.gltf')) return '.gltf';
          return '.glb';
        }
        const modelExtension = getModelExtension(modelUrl);

        return (
          <div style={{ marginTop: '2rem' }}>
            <h2>Generated Model</h2>
            <ImageViewer src={modelData.thumbnail_url} alt="Model Thumbnail" />
            {modelUrl ? (
              <a
                href={`${import.meta.env.VITE_API_URL}/api/model/download/${encodeURIComponent(btoa(modelUrl))}`}
                download={`model${modelExtension}`}
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}
              >
                Download Model
              </a>
            ) : (
              <div style={{marginTop: '1rem'}}>Could not find a compatible model file to download.</div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default ModelPage;
