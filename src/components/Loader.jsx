import React from 'react';
import ReactDOM from 'react-dom'; // חובה לייבא את זה עבור פורטלים
import { loader } from '../assets';

const Loader = () => {
  // התוכן של הלואדר
  const content = (
    <div className="fixed inset-0 z-[99999] w-screen h-screen bg-[rgba(0,0,0,0.7)] flex items-center justify-center flex-col top-0 left-0">
      <img 
        src={loader} 
        alt="loader" 
        className="w-[100px] h-[100px] object-contain"
      />
      <p className="mt-[20px] font-epilogue font-bold text-[20px] text-white text-center">
        <br /> Kindly wait...
      </p>
    </div>
  );

  // ReactDOM.createPortal(התוכן, המיקום בדף)
  // אנחנו משגרים את התוכן ישירות ל-document.body
  return ReactDOM.createPortal(content, document.body);
}

export default Loader;