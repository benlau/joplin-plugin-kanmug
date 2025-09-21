export interface MoveNoteAction {
  type: "moveNote";
  payload: {
    noteId: string;
    oldColumnName: string;
    newColumnName: string;
    newIndex: number;
  };
}

export interface LoadAction {
  type: "load";
}

export interface PollAction {
  type: "poll";
  payload?: {
    showReloadedToast?: boolean;
  };
}

export interface SettingsAction {
  type: "settings";
  payload: {
    target: string;
  };
}

export interface MessageAction {
  type: "messageAction";
  payload: {
    messageId: string;
    actionName: string;
  };
}

export interface OpenNoteAction {
  type: "openNote";
  payload: {
    noteId: string;
  };
}

export interface RemoveNoteFromKanbanAction {
  type: "removeNoteFromKanban";
  payload: {
    noteId: string;
  };
}

export interface AddColumnAction {
  type: "addColumn";
}

export interface DeleteColAction {
  type: "deleteCol";
  payload: {
    colName: string;
  };
}

export interface NewNoteAction {
  type: "newNote";
  payload: {
    colName: string;
    noteId?: string;
  };
}

export interface OpenNoteInNewWindowAction {
  type: "openNoteInNewWindow";
  payload: {
    noteId: string;
  };
}

export interface CloseAction {
  type: "close";
}

export interface OpenKanbanConfigNoteAction {
  type: "openKanbanConfigNote";
}

export interface InsertNoteToColumnAction {
  type: "insertNoteToColumn";
  payload: {
    noteId: string;
    columnName: string;
    index: number;
  };
}

export interface RequestToShowRecentKanbanAction {
  type: "requestToShowRecentKanban";
}

export interface RequestToRemoveRecentKanbanItemAction {
  type: "requestToRemoveRecentKanbanItem";
  payload: {
    noteId: string;
  };
}

export interface OpenKanbanAction {
  type: "openKanban";
  payload: {
    noteId: string;
  };
}

export interface ColumnTitleClickedAction {
  type: "columnTitleClicked";
  payload: {
    link: string;
  };
}

export interface MoveNoteToTopAction {
  type: "moveNoteToTop";
  payload: {
    noteId: string;
    columnName: string;
  };
}

export interface MoveNoteToBottomAction {
  type: "moveNoteToBottom";
  payload: {
    noteId: string;
    columnName: string;
  };
}

export interface MoveNoteToColumnAction {
  type: "moveNoteToColumn";
  payload: {
    noteId: string;
    from: string;
    to: string;
  };
}

export type Action =
  | MoveNoteAction
  | LoadAction
  | PollAction
  | SettingsAction
  | MessageAction
  | OpenNoteAction
  | RemoveNoteFromKanbanAction
  | AddColumnAction
  | DeleteColAction
  | NewNoteAction
  | CloseAction
  | OpenKanbanConfigNoteAction
  | OpenNoteInNewWindowAction
  | InsertNoteToColumnAction
  | RequestToShowRecentKanbanAction
  | OpenKanbanAction
  | RequestToRemoveRecentKanbanItemAction
  | ColumnTitleClickedAction
  | MoveNoteToTopAction
  | MoveNoteToBottomAction
  | MoveNoteToColumnAction;
