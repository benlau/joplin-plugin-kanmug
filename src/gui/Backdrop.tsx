import React, { useCallback, useEffect } from "react";

const Z_INDEX_BACKDROP = Math.floor(Number.MAX_SAFE_INTEGER / 2);

interface BackdropProps {
  children?: React.ReactNode;
  isOpened: boolean;
  onClose: () => void;
}

export function Backdrop({ children, isOpened, onClose }: BackdropProps) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpened) {
        onClose();
      }
    },
    [isOpened, onClose],
  );

  const onClick = useCallback(
    (_e: React.MouseEvent<HTMLDivElement>) => {
      onClose();
    },
    [onClose],
  );

  const onContextMenu = useCallback(
    (_e: React.MouseEvent<HTMLDivElement>) => {
      onClose();
    },
    [onClose],
  );

  const onWheel = useCallback(
    (_e: React.WheelEvent<HTMLDivElement>) => {
      onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  if (!isOpened) {
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
      onContextMenu={onContextMenu}
      onWheel={onWheel}
    >
      {children}
    </div>
  );
}
