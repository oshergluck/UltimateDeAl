import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * IPFSMediaViewer - Cinema Mode
 * Background is black to hide empty spaces.
 * Content is centered and contained within the box.
 */
const IPFSMediaViewer = ({ 
  ipfsLink, 
  className = "", 
  useCanvasForImages = true, 
  objectFit = "contain", // ברירת מחדל: רואים את כל התמונה
  allowDownload = false,
  fileName = "download"
}) => {
  const [mediaType, setMediaType] = useState("image");
  const [, setError] = useState(null); 

  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Helper: Better type detection
  const getInitialType = (url, fName) => {
    if (fName && fName.includes('.')) {
        const ext = fName.split('.').pop().toLowerCase();
        if (['mp4','webm','mov', 'mkv'].includes(ext)) return 'video';
        if (['mp3','wav', 'ogg'].includes(ext)) return 'audio';
        if (['pdf', 'txt', 'json'].includes(ext)) return 'document';
        if (['jpg','jpeg','png','gif','webp', 'svg'].includes(ext)) return 'image';
    }

    if (!url) return "image";
    const cleanUrl = url.split(/[?#]/)[0].toLowerCase();
    
    if (cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".webm") || cleanUrl.endsWith(".mov")) return "video";
    if (cleanUrl.endsWith(".mp3") || cleanUrl.endsWith(".wav")) return "audio";
    if (cleanUrl.endsWith(".pdf")) return "document";
    
    return "image";
  };

  useMemo(() => {
    const initial = getInitialType(ipfsLink, fileName);
    setMediaType(initial);
    setError(null);
  }, [ipfsLink, fileName]);

  // CSS FIX: 
  // 1. bg-black: הרקע שחור כדי להעלים שוליים
  // 2. flex items-center justify-center: ממרכז את התוכן
  const combinedClassName =
    `relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none group rounded-lg ${className}`.trim();

  const blockContextMenu = (e) => e.preventDefault();
  const blockDragStart = (e) => e.preventDefault();

  const handleImageError = () => {
    if (mediaType === "image") setMediaType("video"); 
    else setMediaType("unknown");
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(ipfsLink);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      let extension = "";
      if (blob.type) extension = blob.type.split("/")[1];
      const finalFileName = fileName.includes(".") ? fileName : `${fileName}.${extension || 'file'}`;
      
      link.download = finalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(ipfsLink, "_blank");
    }
  };

  // Canvas Logic
  useEffect(() => {
    if (!useCanvasForImages || mediaType !== "image" || !ipfsLink) return;

    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.crossOrigin = "anonymous"; 

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const w = canvas.clientWidth || 300;
      const h = canvas.clientHeight || 300;

      canvas.width = w;
      canvas.height = h;

      const iw = img.width;
      const ih = img.height;

      // מנקה את הקנבס (משאיר שקוף, והרקע השחור של הדיב ייראה מתחת)
      ctx.clearRect(0, 0, w, h);

      if (objectFit === "contain") {
        const scale = Math.min(w / iw, h / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
      } else {
        let scale = Math.max(w / iw, h / ih);
        let sw = w / scale;
        let sh = h / scale;
        let sx = (iw - sw) / 2;
        let sy = (ih - sh) / 2;
        
        if (!Number.isFinite(sx)) sx = 0;
        if (!Number.isFinite(sy)) sy = 0;
        if (!Number.isFinite(sw)) sw = iw;
        if (!Number.isFinite(sh)) sh = ih;

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      }
    };

    img.onerror = () => handleImageError();
    img.src = ipfsLink;
  }, [ipfsLink, mediaType, useCanvasForImages, objectFit]);

  const renderMedia = () => {
    switch (mediaType) {
      case "image":
        if (useCanvasForImages) {
          return (
            <div className="w-full h-full flex items-center justify-center" onContextMenu={blockContextMenu}>
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
          );
        }
        return (
          <img
            ref={imgRef}
            src={ipfsLink}
            alt="IPFS content"
            // max-w/h מבטיח שהתמונה לא תגלוש, contain שומר פרופורציות
            className="max-w-full max-h-full object-contain"
            loading="lazy"
            draggable={false}
            onError={handleImageError}
            onContextMenu={blockContextMenu}
          />
        );

      case "video":
        return (
          <video
            src={ipfsLink}
            className="w-full h-full max-w-full max-h-full object-contain bg-black"
            controls
            playsInline
            controlsList={allowDownload ? "noplaybackrate noremoteplayback" : "nodownload noplaybackrate noremoteplayback"}
            disablePictureInPicture
            disableRemotePlayback
            onError={() => setMediaType("unknown")}
            onContextMenu={blockContextMenu}
          />
        );

      case "audio":
        return (
          <div className="w-full h-full flex items-center justify-center bg-black min-h-[100px]" onContextMenu={blockContextMenu}>
            <audio
              src={ipfsLink}
              controls
              className="w-10/12"
              controlsList={allowDownload ? "noplaybackrate noremoteplayback" : "nodownload noplaybackrate noremoteplayback"}
            />
          </div>
        );

      case "document":
        return (
          <iframe
            src={ipfsLink}
            title="Document"
            className="w-full h-full min-h-[400px] bg-white"
            referrerPolicy="no-referrer"
            sandbox="allow-same-origin allow-scripts allow-popups" 
            onContextMenu={blockContextMenu}
          />
        );

      case "unknown":
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-black text-white min-h-[200px] text-center gap-4 border border-white/10 rounded-lg">
            <div className="text-5xl opacity-80">📄</div>
            <div>
              <p className="font-bold text-lg text-white">File Available</p>
              <p className="text-xs text-gray-400 mb-4 px-4">
                 Preview is not supported for this file type, but you can access it securely.
              </p>
              
              <button
                onClick={(e) => handleDownload(e)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-sm font-bold transition shadow-lg flex items-center gap-2 mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {allowDownload ? "Download File" : "Open File"}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={combinedClassName} onContextMenu={blockContextMenu}>
      {renderMedia()}

      {allowDownload && mediaType !== 'unknown' && (
        <button
          onClick={handleDownload}
          title="Download File"
          className="absolute top-3 right-3 z-50 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 hover:scale-105 transition-all backdrop-blur-md shadow-lg border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default IPFSMediaViewer;