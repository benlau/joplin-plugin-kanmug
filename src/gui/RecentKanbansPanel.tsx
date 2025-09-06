import React from "react";
import styled from "styled-components";
import { IoMdClose } from "react-icons/io";
import { useMainContext } from "./MainContext";
import ContextMenu from "./ContextMenu";

interface RecentKanbansPanelProps {
  kanbans: Array<{ noteId: string; title: string }>;
  onClose: () => void;
  onRemoveKanban: (noteId: string) => void;
}

const Container = styled.div<{ isOpened: boolean }>(
  ({ isOpened }: { isOpened: boolean }) => ({
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "200px",
    background: "var(--joplin-background-color)",
    boxShadow: "-2px 0 8px rgba(143, 90, 90, 0.15)",
    display: "flex",
    flexDirection: "column",
    borderLeft: "1px solid var(--joplin-divider-color)",
    transform: isOpened ? "translateX(0)" : "translateX(100%)",
    transition: "transform 0.3s ease-out",
  }),
);

const Header = styled.div({
  height: "40px",
  padding: "0 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid var(--joplin-border-color3)",
});

const Title = styled.h2({
  margin: 0,
  fontSize: "16px",
  fontWeight: 600,
});

const CloseButton = styled.button({
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "8px",
  fontSize: "16px",
  "&:hover": {
    backgroundColor: "var(--joplin-background-color-hover3)",
  },
  "& > svg": {
    width: "1.5em",
    height: "1.5em",
    color: "var(--joplin-color3)",
  },
});

const KanbanList = styled.div({
  flex: 1,
  overflowY: "auto",
  padding: "8px 0",
});

const KanbanItem = styled.button({
  width: "100%",
  padding: "8px 16px",
  textAlign: "left",
  background: "none",
  border: "none",
  cursor: "pointer",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  color: "var(--joplin-color3)",
  userSelect: "none",

  "&:hover": {
    backgroundColor: "var(--joplin-background-color-hover3)",
  },

  "&:active": {
    backgroundColor: "var(--joplin-background-color-active3)",
  },
});

export function useRecentKanbansPanelHandle({
  onClose,
  kanbans,
  onRemoveKanban,
}: RecentKanbansPanelProps) {
  const [isOpened, setIsOpened] = React.useState(false);

  const open = React.useCallback(() => {
    setIsOpened(true);
  }, []);

  const close = React.useCallback(() => {
    setIsOpened(false);
    onClose();
  }, [onClose]);

  const props = React.useMemo(
    () => ({
      isOpened,
      kanbans,
      open,
      close,
      onRemoveKanban,
    }),
    [isOpened, kanbans, open, close, onRemoveKanban],
  );

  return props;
}

export function RecentKanbansPanel(
  props: ReturnType<typeof useRecentKanbansPanelHandle>,
) {
  const { kanbans, close, isOpened, onRemoveKanban } = props;

  const { send } = useMainContext();

  const handleKanbanClick = React.useCallback(
    (noteId: string) => {
      send({ type: "openKanban", payload: { noteId } });
    },
    [send],
  );

  const handleContextMenuSelect = React.useCallback(
    (selected: string, noteId: string) => {
      if (selected === "Remove from List") {
        send({ type: "requestToRemoveRecentKanbanItem", payload: { noteId } });
        onRemoveKanban(noteId);
      }
    },
    [send, onRemoveKanban],
  );

  const handleContainerClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
    },
    [],
  );

  return (
    <Container onClick={handleContainerClick} isOpened={isOpened}>
      <Header>
        <Title>Recent</Title>
        <CloseButton onClick={close}>
          <IoMdClose size="20px" />
        </CloseButton>
      </Header>
      <KanbanList>
        {kanbans.map((kanban) => (
          <ContextMenu
            key={kanban.noteId}
            options={["Remove from List"]}
            onSelect={(selected) =>
              handleContextMenuSelect(selected, kanban.noteId)
            }
          >
            <KanbanItem onClick={() => handleKanbanClick(kanban.noteId)}>
              {kanban.title}
            </KanbanItem>
          </ContextMenu>
        ))}
      </KanbanList>
    </Container>
  );
}
