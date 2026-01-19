import React from "react";

const FormField = ({
  labelName,
  placeholder,
  inputType = "text",
  isTextArea,
  value,
  handleChange,
  style = "",
  readOnly = false,
}) => {
  const handleTextAreaChange = (event) => {
    const originalText = event.target.value;
    const textWithSlashN = originalText.replace(/\n/g, "\n");

    event.target.value = textWithSlashN;
    if (handleChange) handleChange(event);
    event.target.value = originalText;
  };

  const baseInputClasses = `
    w-full
    rounded-2xl
    border border-white/10
    bg-white/5
    backdrop-blur-xl
    text-white
    placeholder:text-white/40
    px-4 sm:px-5
    py-3.5
    text-[14px] sm:text-[15px]
    font-epilogue
    outline-none
    transition-all duration-200
    shadow-[0_0_0_0_rgba(255,221,0,0)]
    focus:border-[#FFDD00]/70
    focus:shadow-[0_0_0_4px_rgba(255,221,0,0.18)]
  `;

  const readOnlyClasses = readOnly
    ? `
      opacity-70
      cursor-not-allowed
      bg-white/5
      border-white/10
      focus:border-white/10
      focus:shadow-none
    `
    : `
      hover:border-white/20
    `;

  return (
    <label className={`flex-1 flex flex-col gap-2 ${style}`}>
      {labelName && (
        <span className="text-white font-epilogue font-semibold text-[14px] sm:text-[15px] tracking-wide">
          {labelName}
        </span>
      )}

      {isTextArea ? (
        <textarea
          required
          value={value}
          onChange={handleTextAreaChange}
          rows={8}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`${baseInputClasses} ${readOnlyClasses} resize-none`}
        />
      ) : (
        <input
          required
          value={value}
          onChange={handleChange}
          type={inputType}
          step="1"
          readOnly={readOnly}
          placeholder={placeholder}
          className={`${baseInputClasses} ${readOnlyClasses}`}
        />
      )}
    </label>
  );
};

export default FormField;
