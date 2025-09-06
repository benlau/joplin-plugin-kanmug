import { Action } from "./actions";

// Joplin API related types

export interface UpdateQuery {
  type: "post" | "delete" | "put";
  path: string[];
  body?: object;
  info?: {
    tags?: string[];
  };
}

export interface ConfigNote {
  id: string;
  title: string;
  parent_id: string;
  body: string;
}

export interface JoplinTag {
  id: string;
  parent_id: string;
  title: string;
}

// UI Types

/**
 * Message data displayed above the board in an alertbox.
 */
export interface Message {
  id: string;
  title: string;
  severity: "info" | "warning" | "error";
  details?: string;
  actions: string[];
}

// Config Types

/**
 * Union of all types a rule can accept in the config.
 */
export type RuleValue = string | string[] | boolean | undefined;

export interface Config {
  filters: {
    [ruleName: string]: RuleValue;
    rootNotebookPath?: string;
  };
  sort: {
    by?: string;
  };
  columns: {
    [ruleName: string]: RuleValue;
    name: string;
    backlog?: boolean;
    newNoteTitle?: string;
    link?: string;
  }[];
  display: {
    markdown: string;
  };
}

// Board types

export interface NoteData {
  id: string;
  title: string;
  tags: string[];
  notebookId: string;
  isTodo: boolean;
  isCompleted: boolean;
  due: number;
  order: number;
  createdTime: number;
}

export interface BoardBase {
  isValid: boolean;
  configNoteId: string;
  boardName: string;
  configYaml: string;
}

export interface BoardStateColumn {
  name: string;
  link?: string;
  notes: NoteData[];
}

export interface BoardState {
  name: string;
  columns?: BoardStateColumn[];
  hiddenTags: string[];
  messages: Message[];
}

export interface InvalidBoard extends BoardBase {
  isValid: false;
  errorMessages: Message[];
}

export interface ValidBoard extends BoardBase {
  isValid: true;
  parsedConfig: Config;
  columnNames: string[];
  rootNotebookName: string;
  hiddenTags: string[];
  sortNoteIntoColumn(note: NoteData): string | null;
  actionToQuery(action: Action, boardState: BoardState): UpdateQuery[];
  getBoardState(): Promise<BoardState>;
  isNoteIdOnBoard(id: string, board: BoardBase | undefined): Promise<boolean>;
}

export type Board = ValidBoard | InvalidBoard;

export interface Rule {
  name: string;
  filterNote: (note: NoteData) => boolean;
  set(noteId: string): UpdateQuery[];
  unset(noteId: string): UpdateQuery[];
  editorType: string;
}

export class BoardStateMonad {
  data: BoardState;

  constructor(boardState: BoardState) {
    this.data = boardState;
  }

  findNoteData(noteId: string): {
    note: NoteData | undefined;
    column: BoardStateColumn | undefined;
  } {
    for (const column of this.data.columns ?? []) {
      const note = column.notes.find((n) => n.id === noteId);
      if (note) {
        return { note, column };
      }
    }
    return { note: undefined, column: undefined };
  }

  findAllNoteDataInColumn(columnName: string): NoteData[] {
    return (
      this.data.columns?.find((column) => column.name === columnName)?.notes ||
      []
    );
  }
}

export const accessBoardState = (boardState: BoardState) =>
  new BoardStateMonad(boardState);

export class NoteDataMonad {
  data: NoteData;

  constructor(note: NoteData) {
    this.data = note;
  }

  static fromJoplinNote(note: any) {
    return new NoteDataMonad({
      id: note.id,
      title: note.title,
      tags: [],
      notebookId: note.parent_id,
      isTodo: !!note.is_todo,
      isCompleted: !!note.todo_completed,
      due: note.todo_due,
      order: note.order === 0 ? note.created_time : note.order,
      createdTime: note.created_time,
    });
  }

  static fromNewNote(noteId: string) {
    return new NoteDataMonad({
      id: noteId,
      title: "",
      tags: [],
      notebookId: "",
      isTodo: false,
      isCompleted: false,
      due: 0,
      order: 0,
      createdTime: Date.now(),
    });
  }

  setTagsFromJoplinTagList(tags: JoplinTag[]) {
    this.data = {
      ...this.data,
      tags: tags.map((tag) => tag.title),
    };
    return this;
  }

  applyUpdateQuery(query: UpdateQuery) {
    if (query.type === "put") {
      if (
        query.path.length === 2 &&
        query.path[0] === "notes" &&
        query.path[1] === this.data.id
      ) {
        this.data = {
          ...this.data,
          ...query.body,
        };
      }
    } else if (query.type === "post") {
      if (
        query.path.length === 3 &&
        query.path[0] === "tags" &&
        query.path[2] === "notes" &&
        (query.body as any)?.id === this.data.id
      ) {
        if (query.info?.tags) {
          const tags = new Set([...this.data.tags, ...query.info.tags]);
          this.data = {
            ...this.data,
            tags: Array.from(tags),
          };
        }
      }
    } else if (query.type === "delete") {
      if (
        query.path.length === 4 &&
        query.path[0] === "tags" &&
        query.path[2] === "notes" &&
        query.path[3] === this.data.id
      ) {
        if (query.info?.tags) {
          const tags = new Set(this.data.tags);
          for (const tag of query.info.tags) {
            tags.delete(tag);
          }
          this.data = {
            ...this.data,
            tags: Array.from(tags),
          };
        }
      }
    }
    return this;
  }
}

export class AbortedError extends Error {
  constructor(message: string = "Operation aborted") {
    super(message);
    this.name = "AbortedError";
  }
}

export class TimeoutError extends Error {
  constructor(message: string = "Task timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}
