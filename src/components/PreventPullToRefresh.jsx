import React, { useEffect } from 'react';

function PreventPullToRefresh() {
  useEffect(() => {
    let startY;

    const handleTouchStart = (e) => {
      startY = e.touches[0].pageY;
    };

    const handleTouchMove = (e) => {
      const y = e.touches[0].pageY;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Prevent overscroll only when at the top of the page
      if (scrollTop === 0 && y > startY) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return null;
}

export default PreventPullToRefresh;