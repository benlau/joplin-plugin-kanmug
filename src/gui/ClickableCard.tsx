import React from "react";

import Card from "./Card";
import type { NoteData } from "../types";
import { useMainContext } from "./MainContext";
import ContextMenu from "./ContextMenu";

const MenuItem = {
  RemoveFromKanban: "Remove from Kanban",
  OpenNoteInNewWindow: "Open in New Window",
  MoveToTop: "Move to top",
  MoveToBottom: "Move to bottom",
};

interface ClickableCardProps {
  note: NoteData;
  colName: string;
  isAtTop: boolean;
  isAtBottom: boolean;
}

export default React.forwardRef<HTMLDivElement, ClickableCardProps>(
  ({ note, colName, isAtTop, isAtBottom }, ref) => {
    const { send, dispatch } = useMainContext();

    const handleClick = () => {
      send({
        type: "openNote",
        payload: { noteId: note.id },
      });
    };

    const contextMenuOptions = React.useMemo(() => {
      const baseOptions = [
        MenuItem.OpenNoteInNewWindow,
        MenuItem.RemoveFromKanban,
      ];

      if (isAtTop && isAtBottom) {
        return baseOptions;
      }
      if (isAtBottom) {
        return [...baseOptions, MenuItem.MoveToTop];
      }
      if (isAtTop) {
        return [...baseOptions, MenuItem.MoveToBottom];
      }
      return [...baseOptions, MenuItem.MoveToTop, MenuItem.MoveToBottom];
    }, [isAtTop, isAtBottom]);

    const handleMenu = React.useCallback(
      (option: string) => {
        if (option === MenuItem.RemoveFromKanban) {
          dispatch({
            type: "removeNoteFromKanban",
            payload: { noteId: note.id },
          });
        } else if (option === MenuItem.OpenNoteInNewWindow) {
          send({
            type: "openNoteInNewWindow",
            payload: { noteId: note.id },
          });
        } else if (option === MenuItem.MoveToTop) {
          dispatch({
            type: "moveNoteToTop",
            payload: { noteId: note.id, columnName: colName },
          });
        } else if (option === MenuItem.MoveToBottom) {
          dispatch({
            type: "moveNoteToBottom",
            payload: { noteId: note.id, columnName: colName },
          });
        }
      },
      [note.id, colName, dispatch, send],
    );

    return (
      <div ref={ref} onClick={handleClick}>
        <ContextMenu options={contextMenuOptions} onSelect={handleMenu}>
          <Card note={note} />
        </ContextMenu>
      </div>
    );
  },
);
