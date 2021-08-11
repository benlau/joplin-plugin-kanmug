import React from "react";
import styled from "styled-components";
import { Droppable } from "react-beautiful-dnd";

import type { NoteData } from "../noteData";
import Card from "./Card";

export default function ({
  name,
  notes,
  onOpenConfig,
  onOpenNote,
}: {
  name: string;
  notes: NoteData[];
  onOpenConfig: () => void;
  onOpenNote: (noteId: string) => void;
}) {
  const sortedNotes = [...notes].sort((a, b) => (a.title < b.title ? -1 : 1));
  return (
    <Column>
      <ColumnHeader onDoubleClick={() => onOpenConfig()}>{name}</ColumnHeader>

      <Droppable droppableId={name}>
        {(provided, snapshot) => (
          <DroppableArea
            draggingOver={snapshot.isDraggingOver}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {sortedNotes.map((note, idx) => (
              <Card key={note.id} note={note} index={idx} onOpenNote={onOpenNote}/>
            ))}
            {provided.placeholder}
          </DroppableArea>
        )}
      </Droppable>
    </Column>
  );
}

const Column = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  width: "300px",
  minWidth: "200px",
  padding: "0 15px",
  "& + &": {
    borderLeft: "1px #DDDDDD solid",
  },
});

const ColumnHeader = styled("div")({
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "20px",
  userSelect: "none",
  cursor: "pointer"
});

const DroppableArea = styled("div")<{ draggingOver: boolean }>(
  ({ draggingOver }) => ({
    minHeight: "200px",
    height: "100%",
    borderRadius: "5px",
    overflowY: "auto",
    // border: draggingOver ? "royalblue solid 1px" : "unset"
    boxShadow: draggingOver
      ? "0px 0px 6px 3px rgba(4, 164, 255, 0.41) inset"
      : "unset",
    transition: "box-shadow linear 0.2s",
  })
);
