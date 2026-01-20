import React, { useState, useMemo } from 'react';

const IPFSMediaViewer = ({ ipfsLink, className = '' }) => {
  // כברירת מחדל, אנחנו מניחים שזו תמונה כדי לחסוך בקשות רשת
  // רק אם הטעינה נכשלת, נשנה את הסטייט
  const [mediaType, setMediaType] = useState('image');
  const [error, setError] = useState(null);

  // פונקציה מהירה לזיהוי סיומת אם קיימת ב-URL (ללא בקשת רשת)
  const getInitialType = (url) => {
    if (!url) return 'image';
    const cleanUrl = url.split(/[?#]/)[0].toLowerCase();
    if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mov')) return 'video';
    if (cleanUrl.endsWith('.mp3') || cleanUrl.endsWith('.wav')) return 'audio';
    if (cleanUrl.endsWith('.pdf')) return 'document';
    return 'image';
  };

  // משתמשים ב-useMemo כדי לחשב את הסוג הראשוני רק כשהלינק משתנה
  useMemo(() => {
    const initial = getInitialType(ipfsLink);
    if (initial !== 'image') {
        setMediaType(initial);
    }
  }, [ipfsLink]);

  const combinedClassName = `w-full rounded-lg shadow-lg bg-gray-100 dark:bg-slate-800 overflow-hidden ${className}`.trim();

  const handleImageError = () => {
    // אם התמונה נכשלה לטעון, ננסה להציג כווידאו
    if (mediaType === 'image') {
      setMediaType('video');
    } else {
        // אם גם וידאו לא עובד, נסמן כשגיאה או קובץ כללי
        setMediaType('unknown');
    }
  };

  const renderMedia = () => {
    switch (mediaType) {
      case 'image':
        return (
          <img 
            src={ipfsLink} 
            alt="IPFS content"
            className="w-full h-full object-cover" // שיניתי ל-cover כדי למלא את הריבוע יפה
            loading="lazy"
            onError={handleImageError}
          />
        );

      case 'video':
        return (
          <video 
            src={ipfsLink} 
            className="w-full h-full object-contain bg-black"
            controls 
            playsInline
            preload="metadata"
            onError={() => setMediaType('unknown')} // אם גם וידאו נכשל
          />
        );
      
      case 'audio':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 min-h-[100px]">
            <audio src={ipfsLink} controls className="w-10/12" />
          </div>
        );

      case 'document':
        return (
            <iframe 
            src={ipfsLink} 
            title="Document"
            className="w-full h-full min-h-[200px]"
            />
        );
      
      case 'unknown':
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-800 text-white min-h-[150px]">
            <p className="text-sm mb-2">File not previewable</p>
            <a 
              href={ipfsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline text-xs"
            >
              Open Link
            </a>
          </div>
        );
    }
  };

  return (
    <div className={combinedClassName}>
      {renderMedia()}
    </div>
  );
};

export default IPFSMediaViewer;