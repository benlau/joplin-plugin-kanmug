import React from "react";
import styled from "styled-components";
import Card from "./Card";
import type { NoteData } from "../types";
import { useMainContext } from "./MainContext";
import ContextMenu from "./ContextMenu";
import { useAnnouncer } from "./useAnnouncer";

const MenuItem = {
    RemoveFromKanban: "Remove from Kanban",
    OpenNoteInNewWindow: "Open in New Window",
    MoveToTop: "Move to top",
    MoveToBottom: "Move to bottom",
    MoveToColumn: "Move to column...",
};

interface ClickableCardProps {
    note: NoteData;
    colName: string;
    isAtTop: boolean;
    isAtBottom: boolean;
}

const CardContainer = styled.div`
    position: relative;
    &:focus, &:focus-within {
        outline: none;
    }
`;

const MainActionWrapper = styled.div`
    cursor: pointer;
    &:focus {
        outline: 2px solid var(--joplin-color-accent);
        outline-offset: -2px;
        border-radius: 6px;
    }
`;

const MenuButton = styled.button`
    position: absolute;
    top: 2px;
    right: 2px;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    padding: 4px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--joplin-color);
    font-size: 1.4em;
    line-height: 1;
    &:hover, &:focus {
        background: var(--joplin-background-color-hover3);
        outline: 2px solid var(--joplin-color-accent);
        outline-offset: -2px;
    }
`;

export default React.forwardRef<HTMLDivElement, ClickableCardProps>(
    ({
        note, colName, isAtTop, isAtBottom,
    }, ref) => {
        const { send, dispatch, board } = useMainContext();
        const { announce } = useAnnouncer();
        const [menuContent, setMenuContent] = React.useState<"main" | "move">("main");

        const handleCardClick = () => {
            send({
                type: "openNote",
                payload: { noteId: note.id },
            });
            announce(`${note.title} is now in the editor`);
        };

        const handleCardKeyDown = (ev: React.KeyboardEvent) => {
            if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                handleCardClick();
            }
        };

        const mainOptions = React.useMemo(() => {
            const baseOptions = [
                MenuItem.MoveToColumn,
                MenuItem.OpenNoteInNewWindow,
                MenuItem.RemoveFromKanban,
            ];

            if (isAtTop && isAtBottom) return baseOptions;
            if (isAtBottom) return [...baseOptions, MenuItem.MoveToTop];
            if (isAtTop) return [...baseOptions, MenuItem.MoveToBottom];
            return [...baseOptions, MenuItem.MoveToTop, MenuItem.MoveToBottom];
        }, [isAtTop, isAtBottom]);

        const moveOptions = React.useMemo(
            () => board?.columns?.map((c: any) => c.name).filter((c: any) => c !== colName) || [],
            [board, colName],
        );

        const handleMenuSelect = (option: string): boolean => {
            if (menuContent === "main") {
                switch (option) {
                    case MenuItem.RemoveFromKanban:
                        dispatch({ type: "removeNoteFromKanban", payload: { noteId: note.id } });
                        announce("Card removed from board");
                        break;
                    case MenuItem.OpenNoteInNewWindow:
                        send({ type: "openNoteInNewWindow", payload: { noteId: note.id } });
                        break;
                    case MenuItem.MoveToTop:
                        dispatch({ type: "moveNoteToTop", payload: { noteId: note.id, columnName: colName } });
                        announce("Card moved to top");
                        return false;
                    case MenuItem.MoveToBottom:
                        dispatch({ type: "moveNoteToBottom", payload: { noteId: note.id, columnName: colName } });
                        announce("Card moved to bottom");
                        return false;
                    case MenuItem.MoveToColumn:
                        setMenuContent("move");
                        return false;
                    default:
                        setMenuContent("main");
                }
            } else {
                dispatch({
                    type: "moveNoteToColumn",
                    payload: { noteId: note.id, from: colName, to: option },
                });
                announce(`Card moved to ${option}`);
                setMenuContent("main");
            }
            return true;
        };

        return (
            <CardContainer ref={ref}>
                <MainActionWrapper
                    onClick={handleCardClick}
                    onKeyDown={handleCardKeyDown}
                >
                    <Card note={note} />
                </MainActionWrapper>
                <ContextMenu
                    options={menuContent === "main" ? mainOptions : moveOptions}
                    onSelect={handleMenuSelect}
                >
                    <MenuButton aria-label={`Actions for ${note.title}`}>
                        &hellip;
                    </MenuButton>
                </ContextMenu>
            </CardContainer>
        );
    },
);