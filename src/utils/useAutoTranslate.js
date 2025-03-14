import { useState } from 'react';

const useAutoTranslate = () => {
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true);

  const disableAutoTranslate = () => {
    setAutoTranslateEnabled(false);
  };

  const enableAutoTranslate = () => {
    setAutoTranslateEnabled(true);
  };

  return { autoTranslateEnabled, disableAutoTranslate, enableAutoTranslate };
};

export default useAutoTranslate;