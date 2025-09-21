import React from "react";
import type { Action } from "../actions";
import { BoardState } from "../types";

interface MainContextType {
  dispatch: (action: Action) => Promise<void>;
  send: (action: Action) => Promise<void>;
  board?: BoardState;
}

export const MainContext = React.createContext<MainContextType>({
    dispatch: async () => {},
    send: async () => {},
    board: { name: "", columns: [], hiddenTags: [], messages: [] },
});

export const useMainContext = () => React.useContext(MainContext);
