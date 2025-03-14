import React from 'react'

const CustomButton = ({ btnType, title, handleClick, styles }) => {
  return (
    <button
      type={btnType}
      className={`font-epilogue font-semibold text-[16px] leading-[26px] text-[#000000] min-h-[52px] px-4 rounded-[10px] opacity-[75%] hover:opacity-[100%] duration-500 ease-in-out ${styles} `}
      onClick={handleClick}
    >
      <p className='drop-shadow'>
      {title}
      </p>
    </button>
  )
}

export default CustomButton