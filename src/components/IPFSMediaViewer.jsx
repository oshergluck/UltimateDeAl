import React, { useEffect, useMemo, useRef, useState } from "react";

const IPFSMediaViewer = ({ ipfsLink, className = "", useCanvasForImages = true }) => {
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
    `w-full rounded-lg shadow-lg bg-gray-100 dark:bg-slate-800 overflow-hidden select-none ${className}`.trim();

  const blockContextMenu = (e) => e.preventDefault();
  const blockDragStart = (e) => e.preventDefault();

  const handleImageError = () => {
    if (mediaType === "image") setMediaType("video");
    else setMediaType("unknown");
  };

  // Optional: draw image to canvas to reduce "Save image as" convenience
  useEffect(() => {
    if (!useCanvasForImages || mediaType !== "image" || !ipfsLink) return;

    const img = new Image();
    // Reduce referrer leakage (won’t stop tracking completely)
    img.referrerPolicy = "no-referrer";

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Fit image into canvas (cover)
      const ctx = canvas.getContext("2d");
      const w = canvas.clientWidth || 800;
      const h = canvas.clientHeight || 600;

      canvas.width = w;
      canvas.height = h;

      const iw = img.width;
      const ih = img.height;
      const scale = Math.max(w / iw, h / ih);
      const sw = w / scale;
      const sh = h / scale;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    };

    img.onerror = () => handleImageError();
    img.src = ipfsLink;
  }, [ipfsLink, mediaType, useCanvasForImages]);

  const renderMedia = () => {
    switch (mediaType) {
      case "image":
        // Canvas mode: no <img> element to "Save image as"
        if (useCanvasForImages) {
          return (
            <div
              className="w-full h-full"
              onContextMenu={blockContextMenu}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover"
              />
            </div>
          );
        }

        return (
          <img
            ref={imgRef}
            src={ipfsLink}
            alt="IPFS content"
            className="w-full h-full object-cover"
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
            // small deterrent: prevent keyboard save prompts in some cases
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
        // PDFs inside iframe can still be downloaded; this just reduces leakage.
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
            {/* Removing direct link reduces easy downloading */}
            <p className="text-xs text-white/60 mt-2">Contact support to access this content.</p>
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
