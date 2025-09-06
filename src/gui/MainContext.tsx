import React from "react";
import type { Action } from "../actions";

interface MainContextType {
  dispatch: (action: Action) => Promise<void>;
  send: (action: Action) => Promise<void>;
}

export const MainContext = React.createContext<MainContextType>({
  dispatch: async () => {},
  send: async () => {},
});

export const useMainContext = () => React.useContext(MainContext);
