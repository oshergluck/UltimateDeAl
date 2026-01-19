import { useEffect, useState } from "react";

export default function ProtectedBox({ children }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onBlur = () => setHidden(true);
    const onFocus = () => setHidden(false);

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (hidden) {
    return (
      <div className="p-4 rounded-xl bg-black text-white text-center">
        🔒 Hidden for security (tab not focused)
      </div>
    );
  }

  return <>{children}</>;
}
