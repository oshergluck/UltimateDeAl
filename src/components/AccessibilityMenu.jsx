import React, { useState, useEffect } from 'react';
import accessibilityIcon from '../assets/access.svg';

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('base');
  const [isBlackAndWhite, setIsBlackAndWhite] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const increaseFontSize = () => {
    setFontSize((prevFontSize) => {
      const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];
      const currentIndex = fontSizes.indexOf(prevFontSize);
      const nextIndex = Math.min(currentIndex + 1, fontSizes.length - 1);
      return fontSizes[nextIndex];
    });
  };

  const decreaseFontSize = () => {
    setFontSize((prevFontSize) => {
      const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];
      const currentIndex = fontSizes.indexOf(prevFontSize);
      const nextIndex = Math.max(currentIndex - 1, 0);
      return fontSizes[nextIndex];
    });
  };

  const toggleBlackAndWhite = () => {
    setIsBlackAndWhite(!isBlackAndWhite);
  };

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
  };

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl');
    html.classList.add(`text-${fontSize}`);

    const filters = [];
    if (isBlackAndWhite) filters.push('grayscale(100%)');
    if (isHighContrast) filters.push('contrast(200%)');
    html.style.filter = filters.join(' ');

    // Adjust font size for website content
    const websiteContent = document.getElementById('website-content');
    if (websiteContent) {
      websiteContent.style.fontSize = fontSize === 'base' ? 'sm' : fontSize;
    }
  }, [fontSize, isBlackAndWhite, isHighContrast]);

  return (
    <div className="fixed bottom-4 left-0 z-50">
      <button onClick={toggleMenu} className="accessibility-toggle sm:w-[60px] w-[13%] ">
        <img src={accessibilityIcon} alt="Accessibility Options" className='opacity-[70%] duration-500 ease-in-out hover:opacity-[100%]'/>
      </button>
      {isOpen && (
        <div className="accessibility-options bg-white shadow-md rounded p-3 mt-2">
          <button
            onClick={increaseFontSize}
            className="block w-full py-2 px-4 mb-2 text-left hover:bg-gray-100"
          >
            Increase Font Size
          </button>
          <button
            onClick={decreaseFontSize}
            className="block w-full py-2 px-4 mb-2 text-left hover:bg-gray-100"
          >
            Decrease Font Size
          </button>
          <button
            onClick={toggleHighContrast}
            className="block w-full py-2 px-4 text-left hover:bg-gray-100"
          >
            {isHighContrast ? 'Normal Contrast' : 'High Contrast'}
          </button>
          <button
            onClick={toggleBlackAndWhite}
            className="block w-full py-2 px-4 text-left hover:bg-gray-100"
          >
            {isHighContrast ? 'Colors' : 'Black & White'}
          </button>
        </div>
      )}
      <div id="website-content">
        {/* Your website content here */}
      </div>
    </div>
  );
};

export const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];

export default AccessibilityMenu;
