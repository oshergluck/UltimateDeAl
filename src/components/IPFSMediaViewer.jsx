import React, { useState, useEffect } from 'react';

const IPFSMediaViewer = ({ ipfsLink, className = '' }) => {
  const [contentType, setContentType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset states when ipfsLink changes
    setContentType(null);
    setError(null);
    setIsLoading(true);

    let isMounted = true;
    const controller = new AbortController();

    const fetchContentType = async () => {
      try {
        const response = await fetch(ipfsLink, { 
          method: 'HEAD',
          signal: controller.signal 
        });
        
        if (!isMounted) return;
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const type = response.headers.get('content-type');
        setContentType(type);
        setError(null);
      } catch (error) {
        if (!isMounted) return;
        
        if (error.name === 'AbortError') {
          return;
        }
        
        console.error('Error fetching content type:', error);
        setError(error.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchContentType();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [ipfsLink]);

  // Base styles for different media types
  const baseStyles = {
    video: 'w-full rounded-lg shadow-lg max-h-90 bg-gray-900',
    image: 'w-full rounded-lg shadow-lg max-h-90 object-contain',
    audio: 'w-full rounded-lg shadow-lg bg-gray-100 p-4',
    document: 'w-full rounded-lg shadow-lg bg-gray-100 p-4',
    unknown: 'w-full rounded-lg shadow-lg bg-gray-100 p-4'
  };

  const getMediaType = (mimeType) => {
    if (!mimeType) return 'unknown';
    
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('application/pdf') || 
        mimeType.startsWith('application/msword') ||
        mimeType.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
        mimeType.startsWith('text/')) return 'document';
    
    return 'unknown';
  };

  const mediaType = getMediaType(contentType);
  const combinedClassName = `${baseStyles[mediaType]} ${className}`.trim();

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error loading content: {error}</p>
      </div>
    );
  }

  const renderMedia = () => {
    switch (mediaType) {
      case 'video':
        return (
          <video 
            key={ipfsLink}
            src={ipfsLink+"#t=0.001"} 
            className={combinedClassName}
            controls
            playsInline
          />
        );
      
      case 'image':
        return (
          <img 
            key={ipfsLink}
            src={ipfsLink} 
            alt="IPFS content"
            className={combinedClassName}
            loading="lazy"
          />
        );
      
      case 'audio':
        return (
            <>
          <audio 
            key={ipfsLink}
            src={ipfsLink} 
            className={combinedClassName}
            controls
          />
          <a 
            href={ipfsLink}
            className="text-blue-500 hover:text-blue-700 ml-2 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download Sound File
          </a>
          </>
        );
      
      case 'document':
        return (
          <div className={combinedClassName}>
            <iframe 
              key={ipfsLink}
              src={ipfsLink} 
              title="IPFS Document"
              className="w-full h-96"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        );
      
      default:
        return (
          <div className={combinedClassName}>
            <p className="text-gray-600">
              Unknown content type. You can still access the content here:
              <a 
                href={ipfsLink}
                className="text-blue-500 hover:text-blue-700 ml-2 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Content
              </a>
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderMedia()}
    </div>
  );
};

export default IPFSMediaViewer;