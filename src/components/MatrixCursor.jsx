import React, { useEffect, useRef } from 'react';

const MatrixCursor = () => {
  const canvasRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // התאמת גודל הקנבס למסך
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    // תווים בסגנון מטריקס (קטקאנה ומספרים)
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';

    // פונקציה ליצירת חלקיק חדש
    const createParticle = (x, y) => {
      particles.current.push({
        x: x,
        y: y,
        char: chars[Math.floor(Math.random() * chars.length)],
        fontSize: Math.random() * 15 + 10, // גודל משתנה
        speed: Math.random() * 3 + 2,      // מהירות נפילה
        opacity: 1,                        // שקיפות התחלתית
        lifeRate: Math.random() * 0.02 + 0.01 // קצב היעלמות
      });
    };

    // אירועי עכבר
    const handleMouseMove = (e) => {
      createParticle(e.clientX, e.clientY);
      // יצירת עוד חלקיק לגיוון
      if (Math.random() > 0.5) {
         createParticle(e.clientX + (Math.random() * 20 - 10), e.clientY + (Math.random() * 20 - 10));
      }
    };

    // אירועי מגע (מובייל)
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      createParticle(touch.clientX, touch.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // לולאת האנימציה
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];

        // הגדרת סגנון
        ctx.fillStyle = `rgba(0, 255, 70, ${p.opacity})`;
        ctx.font = `${p.fontSize}px monospace`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = "rgba(0, 255, 70, 0.5)";
        
        // ציור האות
        ctx.fillText(p.char, p.x, p.y);

        // עדכון מיקום (נפילה למטה)
        p.y += p.speed;
        
        // עדכון שקיפות (היעלמות)
        p.opacity -= p.lifeRate;

        // הסרת חלקיקים שנעלמו
        if (p.opacity <= 0) {
          particles.current.splice(i, 1);
          i--;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // קריטי! מאפשר ללחוץ על דברים מתחת לאפקט
        zIndex: 99999 // שיהיה מעל הכל
      }}
    />
  );
};

export default MatrixCursor;