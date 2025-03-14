import React, { useState, useCallback } from 'react';

function DraggableContainer({ children }) {
  const [position, setPosition] = useState({ x: 150, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 150, y: 50 });

  const handleStart = useCallback((clientX, clientY) => {
    setIsDragging(true);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  }, [position]);

  const handleMove = useCallback((clientX, clientY) => {
    if (isDragging) {
      setPosition({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = (e) => handleStart(e.clientX, e.clientY);
  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const handleMouseUp = handleEnd;

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = handleEnd;

  return (
    <div
    style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        height: '135px',
        width: '135px',
        background: '#ffde38',
        userSelect: 'none',
        border: '1px solid #FFFFFF',
        borderRadius: '150px',
        zIndex: '10000001',


      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

export default DraggableContainer;
 