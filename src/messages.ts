/**
 * Message types for communication between the webview and the plugin
 */

export interface LogMessage {
  type: "log";
  payload: {
    log: string;
  };
}

export interface ShowRecentKanbanMessage {
  type: "showRecentKanban";
  payload: {
    recentKanbans: Array<{
      noteId: string;
      title: string;
    }>;
  };
}

export interface ShowKanbanMessage {
  type: "showKanban";
  payload: {
    noteId: string;
  };
}

export interface RefreshMessage {
  type: "refresh";
}

export type WebviewMessage =
  | LogMessage
  | ShowRecentKanbanMessage
  | ShowKanbanMessage
  | RefreshMessage;
