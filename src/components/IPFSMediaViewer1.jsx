import React, { useState, useEffect, useMemo } from 'react';

const IPFSMediaViewer = ({ ipfsLink, className = '' }) => {
  const [contentType, setContentType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to determine type from string extension (Instant, no network needed)
  const getTypeFromExtension = (url) => {
    if (!url) return null;
    const cleanUrl = url.split(/[?#]/)[0]; // Remove query params
    const extension = cleanUrl.split('.').pop().toLowerCase();

    const typeMap = {
      // Images
      jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image',
      // Video
      mp4: 'video', webm: 'video', ogg: 'video', mov: 'video',
      // Audio
      mp3: 'audio', wav: 'audio', m4a: 'audio',
      // Documents
      pdf: 'document', doc: 'document', docx: 'document', txt: 'document', json: 'document'
    };

    return typeMap[extension] || null;
  };

  useEffect(() => {
    if (!ipfsLink) return;

    // 1. Try to get type instantly from URL string
    const instantType = getTypeFromExtension(ipfsLink);
    if (instantType) {
      setContentType(instantType);
      setIsLoading(false);
      return;
    }

    // 2. If no extension, fetch headers (with timeout)
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const fetchContentType = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(ipfsLink, { 
          method: 'HEAD',
          signal: controller.signal 
        });
        
        if (!isMounted) return;
        
        const type = response.headers.get('content-type');
        setContentType(getMediaTypeFromMime(type));
        setError(null);
      } catch (error) {
        if (!isMounted) return;
        // Don't show error to user, just fall back to "unknown" view
        console.warn('Could not determine content type via headers, defaulting to generic view.');
        setContentType('unknown');
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchContentType();

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [ipfsLink]);

  const getMediaTypeFromMime = (mimeType) => {
    if (!mimeType) return 'unknown';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.startsWith('text/')) return 'document';
    return 'unknown';
  };

  // Memoize logic to prevent re-renders
  const mediaType = useMemo(() => {
    // If we have a state type, use it, otherwise 'unknown'
    return contentType || 'unknown';
  }, [contentType]);

  // Styles
  const baseStyles = "w-full rounded-lg shadow-lg bg-gray-100 dark:bg-slate-800 overflow-hidden";
  const combinedClassName = `${baseStyles} ${className}`.trim();

  if (isLoading) {
    return (
      <div className={`${combinedClassName} h-48 flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  // Render Logic
  const renderMedia = () => {
    switch (mediaType) {
      case 'video':
        return (
          <video 
            src={ipfsLink} 
            className="w-full h-auto max-h-[500px] object-contain bg-black"
            controls 
            playsInline
            preload="metadata"
          />
        );
      
      case 'image':
        return (
          <img 
            src={ipfsLink} 
            alt="IPFS content"
            className="w-full h-auto max-h-[500px] object-contain"
            loading="lazy"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
              setContentType('unknown');
            }}
          />
        );
      
      case 'audio':
        return (
          <div className="p-6 flex flex-col items-center justify-center gap-4">
            <div className="text-4xl">🎵</div>
            <audio src={ipfsLink} className="w-full" controls />
          </div>
        );
      
      case 'document':
        return (
          <iframe 
            src={ipfsLink} 
            title="Document Viewer"
            className="w-full h-[500px]"
            sandbox="allow-same-origin allow-scripts"
          />
        );
      
      case 'unknown':
      default:
        return (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-4">
            <div className="text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <p className="font-medium">File Preview Unavailable</p>
              <p className="text-sm opacity-75">Click below to view the file directly</p>
            </div>
            
            <a 
              href={ipfsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
            >
              Open File
            </a>
          </div>
        );
    }
  };

  return (
    <div className={combinedClassName}>
      {error ? (
        <div className="p-4 text-red-500 text-center text-sm">{error}</div>
      ) : renderMedia()}
    </div>
  );
};

export default IPFSMediaViewer;