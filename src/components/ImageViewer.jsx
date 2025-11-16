import React from 'react';

const ImageViewer = ({ src, alt }) => {
  if (!src) return null;

  return (
    <div style={{ margin: '1rem 0' }}>
      <img src={src} alt={alt} style={{ maxWidth: '100%', borderRadius: '8px' }} />
    </div>
  );
};

export default ImageViewer;
