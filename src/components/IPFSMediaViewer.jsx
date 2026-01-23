import React, { useEffect, useMemo, useRef, useState } from "react";

const IPFSMediaViewer = ({ 
  ipfsLink, 
  className = "", 
  useCanvasForImages = true, 
  objectFit = "cover" // NEW: Allows 'contain' for logos, 'cover' for banners
}) => {
  const [mediaType, setMediaType] = useState("image");
  const [error, setError] = useState(null);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const getInitialType = (url) => {
    if (!url) return "image";
    const cleanUrl = url.split(/[?#]/)[0].toLowerCase();
    if (cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".webm") || cleanUrl.endsWith(".mov")) return "video";
    if (cleanUrl.endsWith(".mp3") || cleanUrl.endsWith(".wav")) return "audio";
    if (cleanUrl.endsWith(".pdf")) return "document";
    return "image";
  };

  useMemo(() => {
    const initial = getInitialType(ipfsLink);
    setMediaType(initial);
    setError(null);
  }, [ipfsLink]);

  const combinedClassName =
    `w-full h-full rounded-lg shadow-lg bg-gray-100 dark:bg-slate-800 overflow-hidden select-none ${className}`.trim();

  const blockContextMenu = (e) => e.preventDefault();
  const blockDragStart = (e) => e.preventDefault();

  const handleImageError = () => {
    if (mediaType === "image") setMediaType("video");
    else setMediaType("unknown");
  };

  // Draw image to canvas with correct Object Fit logic
  useEffect(() => {
    if (!useCanvasForImages || mediaType !== "image" || !ipfsLink) return;

    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.crossOrigin = "anonymous"; // Helps with canvas tainting if CORS headers exist

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      // Use parent dimensions or default
      const w = canvas.clientWidth || 300;
      const h = canvas.clientHeight || 300;

      // Set internal resolution to match display size for crisp rendering
      canvas.width = w;
      canvas.height = h;

      const iw = img.width;
      const ih = img.height;

      ctx.clearRect(0, 0, w, h);

      if (objectFit === "contain") {
        // CONTAIN LOGIC: Scale down to fit, center result
        const scale = Math.min(w / iw, h / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
      } else {
        // COVER LOGIC (Default): Scale up to fill, crop excess
        const scale = Math.max(w / iw, h / ih);
        const sw = w / scale;
        const sh = h / scale;
        const sx = (iw - sw) / 2;
        const sy = (ih - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      }
    };

    img.onerror = () => handleImageError();
    img.src = ipfsLink;
  }, [ipfsLink, mediaType, useCanvasForImages, objectFit]); // Re-run when objectFit changes

  const renderMedia = () => {
    switch (mediaType) {
      case "image":
        if (useCanvasForImages) {
          return (
            <div className="w-full h-full" onContextMenu={blockContextMenu}>
              <canvas
                ref={canvasRef}
                className={`w-full h-full object-${objectFit}`} 
              />
            </div>
          );
        }

        return (
          <img
            ref={imgRef}
            src={ipfsLink}
            alt="IPFS content"
            className={`w-full h-full object-${objectFit}`}
            loading="lazy"
            draggable={false}
            onDragStart={blockDragStart}
            onContextMenu={blockContextMenu}
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
        );

      case "video":
        return (
          <video
            src={ipfsLink}
            className="w-full h-full object-contain bg-black"
            controls
            playsInline
            preload="metadata"
            onContextMenu={blockContextMenu}
            controlsList="nodownload noplaybackrate noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) e.preventDefault();
            }}
            onError={() => setMediaType("unknown")}
          />
        );

      case "audio":
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 min-h-[100px]" onContextMenu={blockContextMenu}>
            <audio
              src={ipfsLink}
              controls
              className="w-10/12"
              controlsList="nodownload noplaybackrate noremoteplayback"
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) e.preventDefault();
              }}
            />
          </div>
        );

      case "document":
        return (
          <iframe
            src={ipfsLink}
            title="Document"
            className="w-full h-full min-h-[200px]"
            referrerPolicy="no-referrer"
            sandbox="allow-same-origin allow-scripts"
            onContextMenu={blockContextMenu}
          />
        );

      case "unknown":
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-800 text-white min-h-[150px]">
            <p className="text-sm">File not previewable</p>
          </div>
        );
    }
  };

  return (
    <div className={combinedClassName} onContextMenu={blockContextMenu}>
      {renderMedia()}
    </div>
  );
};

export default IPFSMediaViewer;