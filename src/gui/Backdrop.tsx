import React, { useCallback, useEffect } from "react";

const Z_INDEX_BACKDROP = Math.floor(Number.MAX_SAFE_INTEGER / 2);

interface BackdropProps {
  children?: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
}

export function Backdrop({ children, isVisible, onClose }: BackdropProps) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isVisible) {
        onClose();
      }
    },
    [isVisible, onClose]
  );

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
      onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
        zIndex: Z_INDEX_BACKDROP,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
