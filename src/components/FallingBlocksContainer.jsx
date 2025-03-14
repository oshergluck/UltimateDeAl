import React, { useState, useEffect } from 'react';
import FallingBlock from './FallingBlock';

const FallingBlocksContainer = () => {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    const createBlock = () => {
      const size = Math.random() * (135 - 50) + 50;
      const newBlock = {
        id: Date.now(),
        size,
        position: {
          x: Math.random() * (window.innerWidth - size),
          y: -size,
        },
        rotation: 0,
        rotationSpeed: Math.random() * 10 - 5, // Random speed between -5 and 5
      };
      setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    };

    const intervalId = setInterval(createBlock, 555);

    const animationId = requestAnimationFrame(function animate() {
      setBlocks(prevBlocks =>
        prevBlocks.map(block => ({
          ...block,
          position: {
            ...block.position,
            y: block.position.y + 8,
          },
          rotation: (block.rotation + block.rotationSpeed) % 360,
        })).filter(block => block.position.y < window.innerHeight)
      );
      requestAnimationFrame(animate);
    });

    return () => {
      clearInterval(intervalId);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="bg-transparent w-full h-screen overflow-hidden">
      {blocks.map(block => (
        <FallingBlock 
          key={block.id} 
          size={block.size} 
          position={block.position} 
          rotation={block.rotation}
        />
      ))}
    </div>
  );
};

export default FallingBlocksContainer;