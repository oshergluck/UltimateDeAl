import React, { useState } from 'react';

const CustomDropdown = ({ categories, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('Choose Coin');

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    onSelect(item);
    setIsOpen(false);
  };

  return (
    <div className="z-50 relative inline-block text-left mb-[20px] sm:w-3/12 w-10/12 ease-in-out duration-500 hover:opacity-[100%] opacity-[70%]">
      <div>
        <button type="button" onClick={toggleDropdown} className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-[#424242] px-3 py-2 text-sm font-semibold text-[#FFFFFF] ring-inset !text-[18px]" id="menu-button" aria-expanded={isOpen} aria-haspopup="true">
          {selectedItem}
          <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="absolute h-[325px] overflow-auto touch-auto left-0 z-50 mt-2 w-56 origin-top-right rounded-md linear-gradient shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="50">
          <div className="py-1" role="none">
            {categories.map((category, index) => (
              <span key={index} href="#" className="text-[#FFFFFF] block px-4 z-50 py-2 text-sm hover:bg-[#FFFFFF] hover:bg-opacity-[25%]" role="menuitem" tabIndex="50" onClick={() => handleItemClick(category)}>
                {category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
