import { useContext, createContext } from "react";

export const AnnouncerContext = createContext({
    announce: (_message: string) => {
    },
});

export const useAnnouncer = () => useContext(AnnouncerContext);