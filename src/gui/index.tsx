import React, { useState } from "react";
import { render } from "react-dom";
import styled from "styled-components";
import {
    IoMdSettings, IoMdAdd, IoMdClose, IoMdRefresh,
} from "react-icons/io";
import { MdOutlineViewKanban } from "react-icons/md";

import { WebviewMessage } from "src/messages";
import { capitalize } from "../utils";
import { DispatchFn, useRemoteBoard } from "./hooks";
import { DragDropContext } from "./DragDrop";
import Column from "./Column";
import type { Board, BoardState, Message } from "../types";
import { MainContext, useMainContext } from "./MainContext";
import { RecentKanbansPanel, useRecentKanbansPanelHandle } from "./RecentKanbansPanel";
import { AnnouncerContext } from "./useAnnouncer";

export const DispatchContext = React.createContext<DispatchFn>(async () => {});
export const IsWaitingContext = React.createContext<boolean>(false);

const REFRESH_DISABLED_TIME = 1000;

const LoadingCont = styled("div")({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "start",
});

const IconCont = styled("div")({
    margin: "auto 0.1em",
    padding: "0.1em",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "5px",
    cursor: "pointer",

    "&:nth-child(3)": {
        marginLeft: "auto",
    },
    "&:hover": {
        backgroundColor: "var(--joplin-background-color-hover3)",
    },
    "& > svg": {
        width: "1.3em",
        height: "1.3em",
        color: "var(--joplin-color3)",
    },
});

function MessageBox({
    message,
    onMsgAction,
}: {
  message: Message;
  onMsgAction: (action: string) => void;
}) {
    const {
        title, actions, severity, details,
    } = message;
    const btns = actions.map((action) => (
        <button key={action} onClick={() => onMsgAction(action)}>
            {capitalize(action)}
        </button>
    ));
    const summary = (
        <>
            <MessageTitle>{title}</MessageTitle>
            {btns}
        </>
    );

    return (
        <MessageBoxContainer severity={severity}>
            {details ? (
                <MessageDetailsWrapper>
                    <MessageSummary>{summary}</MessageSummary>
                    <MessageDetail>{details}</MessageDetail>
                </MessageDetailsWrapper>
            ) : (
                summary
            )}
        </MessageBoxContainer>
    );
}

function Content(props: { board?: BoardState }) {
    const { board } = props;
    const { dispatch, send } = useMainContext();
    const [isRefreshDisabled, setIsRefreshDisabled] = useState(false);
    const [kanbans, setKanbans] = useState<{noteId: string, title: string}[]>([]);

    const handleRemoveKanban = React.useCallback((noteId: string) => {
        setKanbans(kanbans.filter((kanban) => kanban.noteId !== noteId));
    }, [kanbans]);

    const recentKanbanHandle = useRecentKanbansPanelHandle({
        kanbans,
        onClose: () => {},
        onRemoveKanban: handleRemoveKanban,
    });

    React.useEffect(() => {
        webviewApi.onMessage((payload: {message: WebviewMessage}) => {
            try {
                const { message } = payload;
                if (message.type === "refresh") {
                    dispatch({ type: "poll" });
                } else if (message.type === "showRecentKanban") {
                    setKanbans(message.payload.recentKanbans);
                    recentKanbanHandle.open();
                } else if (message.type === "log") {
                    console.info(message.payload.log);
                }
            } catch (e) {
                console.error("Error handling message", e);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const notesToShow = board?.columns?.map((col) => ({
        ...col,
        notes: col.notes.map((note) => ({
            ...note,
            tags: note.tags.filter((tag) => !board.hiddenTags.includes(tag)),
        })),
    }));

    const handleRefresh = React.useCallback(() => {
        if (!isRefreshDisabled) {
            dispatch({
                type: "poll",
                payload: {
                    showReloadedToast: true,
                },
            });
            setIsRefreshDisabled(true);
            setTimeout(() => setIsRefreshDisabled(false), REFRESH_DISABLED_TIME);
        }
    }, [dispatch, isRefreshDisabled]);

    const handleShowRecentKanban = React.useCallback(() => {
        send({ type: "requestToShowRecentKanban" });
    }, [dispatch]);

    const closeKanban = React.useCallback(() => {
        send({ type: "close" });
    }, [dispatch]);

    const cont = board ? (
        <Container>
            <Header>
                <IconCont
                    role="button"
                    aria-label="Close Kanban"
                    onClick={closeKanban}
                >
                    <IoMdClose size="20px"/>
                </IconCont>
                <BoardTitle
                    onClick={() => send({ type: "openKanbanConfigNote" })}
                >
                    <h1>{board.name}</h1>
                </BoardTitle>

                <IconCont role="button" aria-label="Show recent Kanbans" onClick={handleShowRecentKanban}>
                    <MdOutlineViewKanban size="25px" />
                </IconCont>
                <IconCont
                    role="button"
                    aria-label="Refresh Kanban"
                    onClick={handleRefresh}
                >
                    <IoMdRefresh size="25px" />
                </IconCont>
                <IconCont
                    role="button"
                    aria-label="Settings"
                    onClick={() => dispatch({ type: "settings", payload: { target: "filters" } })
                    }
                >
                    <IoMdSettings size="25px" />
                </IconCont>

                <IconCont
                    role="button"
                    aria-label="Add new column"
                    onClick={() => dispatch({ type: "settings", payload: { target: "columnnew" } })
                    }
                >
                    <IoMdAdd size="25px" />
                </IconCont>
            </Header>

            <MessagesCont>
                {board.messages.map((msg, idx) => (
                    <MessageBox
                        key={idx}
                        message={msg}
                        onMsgAction={(action) => dispatch({
                            type: "messageAction",
                            payload: { actionName: action, messageId: msg.id },
                        })
                        }
                    />
                ))}
            </MessagesCont>

            {board.columns && (
                <ColumnsCont>
                    {notesToShow?.map(({ name, link, notes }) => (
                        <Column key={name} name={name} link={link} notes={notes} />
                    ))}
                </ColumnsCont>
            )}
            <RecentKanbansPanel
                {...recentKanbanHandle}
            />
        </Container>
    ) : (
        <h1>
            <LoadingCont>
                <IconCont onClick={closeKanban}>
                    <IoMdClose size="20px"/>
                </IconCont>
                <div>Loading...</div>
            </LoadingCont>
        </h1>
    );

    return cont;
}

function App() {
    const [board, dispatch, send] = useRemoteBoard();
    const mainContextValue = React.useMemo(() => ({
        dispatch,
        send,
        board,
    }), [dispatch, send, board]);

    const announcerRef = React.useRef<HTMLDivElement>(null);
    const announce = React.useCallback((message: string) => {
        if (announcerRef.current) {
            announcerRef.current.textContent = "";
            announcerRef.current.textContent = message;
        }
    }, []);

    const announcerContextValue = React.useMemo(() => ({ announce }), [announce]);

    // @TODO: Remove DispatchContext.Provider
    return (
        <AnnouncerContext.Provider value={announcerContextValue}>
            <MainContext.Provider value={mainContextValue}>
                <DispatchContext.Provider value={dispatch}>
                    <DragDropContext>
                        <Content board={board} />
                    </DragDropContext>
                </DispatchContext.Provider>
            </MainContext.Provider>
            <div
                ref={announcerRef}
                style={{
                    position: "absolute",
                    width: "1px",
                    height: "1px",
                    padding: "0",
                    margin: "-1px",
                    overflow: "hidden",
                    clip: "rect(0, 0, 0, 0)",
                    whiteSpace: "nowrap",
                    border: "0",
                }}
                aria-live="assertive"
                aria-atomic="true"
            />
        </AnnouncerContext.Provider>
    );
}

render(<App />, document.getElementById("root"));

const Container = styled("div")({
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    minWidth: "100%",
    height: "100%",
});

const Header = styled("div")({
    fontSize: "1.2rem",
    fontWeight: "bold",
    padding: "0.3em",
    marginBottom: "0.5em",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
});

const ColumnsCont = styled("div")({
    display: "flex",
    alignItems: "stretch",
    flexGrow: 1,
    overflowY: "auto",
    marginBottom: "20px",
});

const MessagesCont = styled("div")({
    padding: "0 15px",
});

const messageColors: { [k in Message["severity"]]: [string, string, string] } = {
    info: ["#cfe2ff", "#b6d4fe", "#084298"],
    warning: ["#fff3cd", "#ffecb5", "#664d03"],
    error: ["#f8d7da", "#f5c2c7", "#842029"],
};

const MessageBoxContainer = styled("div")<{ severity: Message["severity"] }>(
    ({ severity }) => ({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "0.8em",
        // fontSize: "1.1rem",
        borderRadius: "7px",
        border: `1px solid ${messageColors[severity][1]}`,
        color: messageColors[severity][2],
        backgroundColor: messageColors[severity][0],
        marginBottom: "0.7em",
        "&:last-child": {
            marginBottom: "1em",
        },
    }),
);

const MessageTitle = styled("div")({
    flexGrow: 1,
});

const MessageDetailsWrapper = styled("details")({
    width: "100%",
});

const MessageSummary = styled("summary")({
    display: "flex",
    alignItems: "center",
});

const MessageDetail = styled("code")({
    display: "block",
    paddingTop: "15px",
    whiteSpace: "pre-wrap",
});

const BoardTitle = styled("div")({
    cursor: "pointer",
    "&:hover": {
        opacity: 0.7,
    },
    "&:active": {
        opacity: 0.5,
    },
});
