import React, { useState } from 'react';
import { logoOfWebsite } from '../assets';

const CustomDropdownStores = ({ categories, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState({
    name: 'Choose A Store',
    address: "0x5763E56b28a6F67cF615fbBF26A8336FecE5430A",
    logo: logoOfWebsite  // You need to provide a default logo in the props
  });

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    onSelect(item.name);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button type="button" onClick={toggleDropdown} className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-transparent px-3 py-2 text-sm font-semibold text-[#FFFFFF] ring-inset items-center" id="menu-button" aria-expanded={isOpen} aria-haspopup="true">
          <img src={selectedItem.logo} alt={`Logo of ${selectedItem.name}`} className="w-12 h-12 mr-2" loading="lazy" />
          {selectedItem.name}
          <svg className="-mr-1 ml-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="absolute h-[430px] overflow-auto touch-auto left-0 z-10 mt-2 w-56 origin-top-right rounded-md linear-gradient shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">
          <div className="py-1" role="none">
            {categories.map((category, index) => (
              <span key={index} className="text-[#FFFFFF] block px-4 py-2 text-sm hover:bg-[#FFFFFF] hover:bg-opacity-[25%]" role="menuitem" tabIndex="-1" onClick={() => handleItemClick({name: category.name, logo: category.logo || logoOfWebsite})}>
                <img src={category.logo || defaultLogo} alt={`Logo of ${category.name}`} className="w-12 h-12 mr-2" loading="lazy" />
                {category.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdownStores;
