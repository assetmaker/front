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
          throw new Error(res.error || '작업 상태를 가져올 수 없습니다.');
        }

        const task = res.data;
        setProgress(task.progress || 0);

        if (task.status === 'SUCCEEDED') {
          clearInterval(interval);
          setPollingTaskId(null);
          setProgress(100);

          if (isRefine) {
            // This was the refine task, we are done
            setStatusMessage('모델이 성공적으로 생성되었습니다!');
            setModelData(task);
          } else {
            // This was the preview task, start the refine task
            setStatusMessage('미리보기가 완료되었습니다. 최종 모델을 생성하는 중...');
            const refineRes = await createModelRefineTask(task.id);
            if (!refineRes.success) {
              throw new Error(refineRes.error || '개선 작업을 생성할 수 없습니다.');
            }
            setIsRefine(true);
            setPollingTaskId(refineRes.data.result);
          }
        } else if (task.status === 'FAILED') {
          throw new Error(task.error_message || '생성 중 작업이 실패했습니다.');
        }
        // If still PENDING or IN_PROGRESS, the status message is already set
        // and the loop will continue.

      } catch (err) {
        clearInterval(interval);
        setError(err.message);
        setStatusMessage('오류가 발생했습니다.');
        setPollingTaskId(null);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [pollingTaskId, isRefine]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) {
      setError('프롬프트를 입력하세요.');
      return;
    }
    // Reset state
    setError(null);
    setModelData(null);
    setProgress(0);
    setIsRefine(false);
    setPollingTaskId(null);

    try {
      setStatusMessage('미리보기 작업을 생성하는 중...');
      const res = await createModelPreviewTask(prompt);
      if (!res.success || !res.data.result) {
        throw new Error(res.error || '미리보기 작업을 생성할 수 없습니다.');
      }
      setStatusMessage('미리보기 모델을 생성하는 중... (1분 정도 소요될 수 있습니다)');
      setPollingTaskId(res.data.result);
    } catch (err) {
      setError(err.message);
      setStatusMessage('오류가 발생했습니다.');
    }
  };

  const isGenerating = !!pollingTaskId;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>3D 모델 생성</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="3D 모델을 생성하기 위한 프롬프트를 입력하세요..."
          style={{ width: '100%', minHeight: '100px', padding: '0.5rem', fontSize: '1rem' }}
          disabled={isGenerating}
        />
        <button type="submit" disabled={isGenerating} style={{ marginTop: '1rem' }}>
          {isGenerating ? '생성 중...' : '생성'}
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
            <h2>생성된 모델</h2>
            <ImageViewer src={modelData.thumbnail_url} alt="모델 썸네일" />
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
                모델 다운로드
              </a>
            ) : (
              <div style={{marginTop: '1rem'}}>다운로드할 수 있는 호환되는 모델 파일을 찾을 수 없습니다.</div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default ModelPage;
