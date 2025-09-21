import React, {
    useState, useEffect, useCallback, useRef,
} from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { Backdrop } from "./Backdrop";

const MENU_WIDTH = 150;

export default function ({
    options,
    onSelect,
    children,
}: {
    options: string[];
    onSelect: (selected: string) => void | boolean;
    children: React.ReactElement;
}) {
    const [state, setState] = useState<{
        posX: number | null;
        posY: number | null;
    }>({ posX: null, posY: null });
    const triggerRef = useRef<HTMLElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const { posX, posY } = state;
    const isOpen = posX !== null && posY !== null;

    useEffect(() => {
        if (isOpen) {
            const activeElement = document.activeElement as HTMLElement;
            setTimeout(() => {
                const itemToFocus = menuRef.current?.contains(activeElement)
                    ? activeElement
                    : menuRef.current?.querySelector('[role="menuitem"]') as HTMLElement;
                itemToFocus?.focus();
            }, 0);
        } else {
            triggerRef.current?.focus();
        }
    }, [isOpen, options]);

    const openMenu = (ev: React.MouseEvent | React.KeyboardEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        const rect = ev.currentTarget.getBoundingClientRect();
        setState({
            posX: rect.left,
            posY: rect.bottom,
        });
    };

    const closeMenu = useCallback(() => {
        setState({ posX: null, posY: null });
    }, []);

    const handleKeyDown = (ev: React.KeyboardEvent) => {
        if (!isOpen) return;

        const menuItems = Array.from(
            menuRef.current?.querySelectorAll('[role="menuitem"]') || []
        ) as HTMLElement[];

        if (!menuItems.length) return;

        const activeElement = document.activeElement as HTMLElement;
        const currentIndex = menuItems.indexOf(activeElement);

        switch (ev.key) {
            case "Escape":
                closeMenu();
                break;
            case "ArrowDown":
                ev.preventDefault();
                const nextIndex = (currentIndex + 1) % menuItems.length;
                menuItems[nextIndex]?.focus();
                break;
            case "ArrowUp":
                ev.preventDefault();
                const prevIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
                menuItems[prevIndex]?.focus();
                break;
            case "Tab":
                ev.preventDefault();
                if (ev.shiftKey) {
                    const prevIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
                    menuItems[prevIndex]?.focus();
                } else {
                    const nextIndex = (currentIndex + 1) % menuItems.length;
                    menuItems[nextIndex]?.focus();
                }
                break;
        }
    };

    const trigger = React.cloneElement(children, {
        onContextMenu: openMenu,
        onClick: openMenu,
        onKeyDown: (ev: React.KeyboardEvent) => {
            if (ev.key === "Enter" || ev.key === " ") {
                openMenu(ev);
            }
        },
        ref: (node: HTMLElement) => {
            triggerRef.current = node;
            const { ref } = children as any;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
        },
        "aria-haspopup": "true",
        "aria-expanded": isOpen,
    });

    return (
        <>
            {trigger}
            {isOpen
                && createPortal(
                    <Backdrop isOpened={isOpen} onClose={closeMenu}>
                        <FloatingMenu
                            ref={menuRef}
                            role="menu"
                            aria-orientation="vertical"
                            onKeyDown={handleKeyDown}
                            posX={posX}
                            posY={posY}
                            tabIndex={-1}
                        >
                            {options.map((opt) => (
                                <MenuItem
                                    key={opt}
                                    role="menuitem"
                                    tabIndex={-1}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const keepOpen = onSelect(opt);
                                        if (keepOpen === false) {
                                            menuRef.current?.focus();
                                        } else {
                                            closeMenu();
                                        }
                                    }}
                                >
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
        borderRadius: "4px",
        outline: "none",
    }),
);

const MenuItem = styled.button({
    display: "block",
    width: "100%",
    border: "none",
    backgroundColor: "transparent",
    textAlign: "left",
    padding: "7px 14px",
    userSelect: "none",
    color: "var(--joplin-color)",
    "&:hover, &:focus": {
        backgroundColor: "var(--joplin-background-color-hover3)",
        outline: "none",
    },
});