import React from 'react'

const FormField = ({ labelName, placeholder, inputType, isTextArea, value, handleChange,style }) => {

  const handleTextAreaChange = (event) => {
    const originalText = event.target.value;
    const textWithSlashN = originalText.replace(/\n/g, '\n');
    
    // Modify the event's target value to be the modified text
    event.target.value = textWithSlashN;

    // Call the parent handleChange with the modified event
    handleChange(event);

    // Restore the original text to allow for further editing
    event.target.value = originalText;
};
  return (
    <label className="flex-1 flex flex-col">
      {labelName && (
        <span className="font-epilogue font-medium text-[20px] leading-[22px] text-[#FFFFFF] mb-[5px]">{labelName}</span>
      )}
      {isTextArea ? (
        <textarea 
          required
          value={value}
          onChange={handleTextAreaChange}
          rows={10}
          placeholder={placeholder}
          className={`py-[15px] sm:px-[25px] px-[15px] border-[1px] border-gray-600 outline-none linear-gradient1 font-epilogue text-white text-[16px] placeholder:text-white placeholder:opacity-[100%] rounded-[15px] ${style}`}
        />
      ) : (
        <input 
          required
          value={value}
          onChange={handleChange}
          type={inputType}
          step="1"
          placeholder={placeholder}
          className={`py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-gray-600 linear-gradient1 font-epilogue text-white text-[16px] placeholder:text-white placeholder:opacity-[100%] rounded-[15px] ${style}`}
        />
      )}
    </label>
  )
}

export default FormField;
