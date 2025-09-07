import React, { useState } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { Backdrop } from "./Backdrop";

const _CLOSE_EVENTS = ["click", "contextmenu", "wheel"];
const MENU_WIDTH = 150;

export default function ({
  options,
  onSelect,
  children,
}: {
  options: string[];
  onSelect: (selected: string) => void;
  children: React.ReactElement;
}) {
  const [{ posX, posY }, setPos] = useState<{
    posX: number | null;
    posY: number | null;
  }>({ posX: null, posY: null });
  const isOpen = posX !== null && posY !== null;

  const handleMenu = (ev: React.MouseEvent) => {
    ev.preventDefault();
    setPos({ posX: ev.clientX, posY: ev.clientY });
  };

  return (
    <>
      <div onContextMenu={handleMenu}>{children}</div>
      {isOpen &&
        createPortal(
          <Backdrop
            isOpened={isOpen}
            onClose={() => setPos({ posX: null, posY: null })}
          >
            <FloatingMenu posX={posX} posY={posY}>
              {options.map((opt, idx) => (
                <MenuItem key={idx} onClick={() => onSelect(opt)}>
                  {opt}
                </MenuItem>
              ))}
            </FloatingMenu>
          </Backdrop>,
          document.getElementById("joplin-plugin-content-root")!,
        )}
    </>
  );
}

const FloatingMenu = styled.div<{ posX: number | null; posY: number | null }>(
  ({ posX, posY }) => ({
    position: "fixed",
    top: posY || "0",
    left: posX || "0",
    width: `${MENU_WIDTH}px`,
    backgroundColor: "var(--joplin-background-color)",
    border: "1px solid var(--joplin-divider-color)",
    padding: "2px 0",
    zIndex: 10000,
  }),
);

const MenuItem = styled.div({
  padding: "7px 14px",
  userSelect: "none",
  "&:hover": {
    backgroundColor: "var(--joplin-background-color-hover3)",
  },
});
