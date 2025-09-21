import React, { useContext } from "react";
import styled from "styled-components";
import { IoMdAdd } from "react-icons/io";
import { MainContext } from "./MainContext";
import { useRefState } from "./hooks";

const clickEventThrottleTime = 500;

const Container = styled("div")({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "1.1rem",
    fontWeight: "bold",
    marginBottom: "20px",
    userSelect: "none",
});

const ColumnTitle = styled("div")({
    cursor: "pointer",
    textDecoration: "underline",
    "&:hover": {
        opacity: 0.7,
    },
    "&:active": {
        opacity: 0.5,
    },
});

const AddIconCont = styled("span")({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
    borderRadius: "5px",

    "&:hover": {
        backgroundColor: "var(--joplin-background-color-hover3)",
    },
    "& > svg": {
        width: "1.5em",
        height: "1.5em",
        color: "var(--joplin-color3)",
    },
});

type Props = {
    name: string;
    link?: string;
}

export const ColumnHeader = ({ name, link }: Props) => {
    const { send, dispatch } = useContext(MainContext);

    const handleTitleClick = React.useCallback(() => {
        if (link) {
            send({
                type: "columnTitleClicked",
                payload: { link },
            });
        }
    }, [name, link, send]);

    const [isNewNoteDisabled, setIsNewNoteDisabled] = useRefState(false);

    const handleNewNote = React.useCallback(() => {
        if (isNewNoteDisabled.current) return;

        setIsNewNoteDisabled(true);
        setTimeout(() => setIsNewNoteDisabled(false), clickEventThrottleTime);

        dispatch({
            type: "newNote",
            payload: {
                colName: name,
            },
        });
    }, [name, dispatch]);

    return (
        <Container>
            {
                link ? (
                    <ColumnTitle onClick={handleTitleClick}>
                        <h2>{name}</h2>
                    </ColumnTitle>
                ) : (
                    <h2>{name}</h2>
                )
            }
            <AddIconCont role="button" aria-label="Add new note" onClick={handleNewNote}>
                <IoMdAdd />
            </AddIconCont>
        </Container>
    );
};
