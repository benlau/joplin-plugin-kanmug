import joplin from "api";
import { tryWaitUntilTimeout } from "../utils/timer";
import { NoteData, NoteDataMonad } from "../types";

type NoteChangeListener = (noteId: string) => Promise<boolean>;

const DefaultTimeout = 500;

export class JoplinService {
  onNoteChangeListeners: NoteChangeListener[] = [];

  onNoteSelectionChangeListeners: NoteChangeListener[] = [];

  toastCounter = 0;

  start() {
    joplin.workspace.onNoteChange(async ({ id }) => {
      this.onNoteChangeListeners = (
        await Promise.all(
          this.onNoteChangeListeners.map((listener) => listener(id)),
        )
      )
        .map((keep, i) => (keep ? this.onNoteChangeListeners[i] : null))
        .filter((listener) => listener !== null) as NoteChangeListener[];
    });

    joplin.workspace.onNoteSelectionChange(
      async ({ value }: { value: [string?] }) => {
        this.onNoteSelectionChangeListeners = (
          await Promise.all(
            this.onNoteSelectionChangeListeners.map((listener) =>
              listener(value?.[0] as string),
            ),
          )
        )
          .map((keep, i) =>
            keep ? this.onNoteSelectionChangeListeners[i] : null,
          )
          .filter((listener) => listener !== null) as NoteChangeListener[];
      },
    );
  }

  async getSelectedNotebookId(): Promise<string> {
    const selectedFolder = await joplin.workspace.selectedFolder();
    return selectedFolder.id;
  }

  async createUntitledNote(): Promise<string> {
    const selectedNote = await joplin.workspace.selectedNote();
    joplin.commands.execute("newNote");
    return new Promise((resolve) => {
      let isResolved = false;
      const func = async (id: string) => {
        if (isResolved) {
          return false;
        }
        if (id !== selectedNote.id) {
          isResolved = true;
          resolve(id);
          return false;
        }
        return true;
      };

      this.onNoteChange(func);
      this.onNoteSelectionChange(func);
    });
  }

  async getNoteDataById(noteId: string): Promise<NoteData> {
    const note = await joplin.data.get(["notes", noteId]);
    const tags = await joplin.data.get(["notes", noteId, "tags"]);
    const noteData = NoteDataMonad.fromJoplinNote(
      note,
    ).setTagsFromJoplinTagList(tags.items).data;
    return noteData;
  }

  async getNoteTitleById(noteId: string): Promise<string | undefined> {
    const note = await joplin.data.get(["notes", noteId], {
      fields: ["title"],
    });
    if (note == null) {
      return undefined;
    }
    return note.title;
  }

  openItem(item: string) {
    joplin.commands.execute("openItem", item);
  }

  openNote(noteId: string) {
    // The "openNote" command can not open a note
    // where its parent_id is ""
    // So we use "openItem" instead
    joplin.commands.execute("openItem", `:/${noteId}`);
  }

  onNoteChange(listener: NoteChangeListener) {
    this.onNoteChangeListeners.push(listener);
  }

  onNoteSelectionChange(listener: NoteChangeListener) {
    this.onNoteSelectionChangeListeners.push(listener);
  }

  async waitUntilNoteAvailable(
    noteId: string,
    timeout: number = DefaultTimeout,
  ) {
    try {
      const promise = new Promise((resolve) => {
        tryWaitUntilTimeout(async () => {
          const query = `id:${noteId}`;
          const note = await joplin.data.get(["search"], { query });
          if (note.items.length > 0) {
            resolve(note.items[0]);
            return true;
          }
          return false;
        }, timeout);
      });
      return await promise;
    } catch {
      return null;
    }
  }

  async toast(
    message: string,
    type: "success" | "error" | "info" = "success",
    duration: number = 3000,
  ) {
    try {
      await (joplin.views.dialogs as any).showToast({
        message,
        duration: duration + (this.toastCounter++ % 50),
        type,
      });
    } catch {
      // Ignore
    }
  }
}
