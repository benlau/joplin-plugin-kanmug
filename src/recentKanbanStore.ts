import joplin from "api";

const RECENT_KANBANS_MAX_SIZE = 100;
export const RECENT_KANBANS_STORAGE_KEY = "RecentKanbans";

export type RecentKanbanItem = {
  noteId: string;
  title: string;
  bookmarked: boolean;
};

export class RecentKanbanStore {
  private kanbans: Array<RecentKanbanItem> = [];

  public getKanbans() {
    return this.kanbans;
  }

  async load() {
    const storedKanbans = await joplin.settings.value(RECENT_KANBANS_STORAGE_KEY);
    if (storedKanbans) {
      try {
        if (Array.isArray(storedKanbans)) {
          this.kanbans = storedKanbans.map(kanban => ({
            noteId: kanban.noteId,
            title: kanban.title,
            bookmarked: kanban.bookmarked ?? false
          }));
        }
      } catch (error) {
        this.kanbans = [];
      }
    }
  }

  prependKanban(noteId: string, title: string, bookmarked?: boolean) {
    const existingKanban = this.kanbans.find((kanban) => kanban.noteId === noteId);
    if (existingKanban) {
      existingKanban.title = title;
      existingKanban.bookmarked = bookmarked ?? existingKanban.bookmarked;

      this.kanbans = this.kanbans.filter((kanban) => kanban.noteId !== noteId);
      this.kanbans.unshift(existingKanban);

    } else {
      const kanban = {
        noteId,
        title,
        bookmarked: false,
      };
      this.kanbans.unshift(kanban);
    }

    if (this.kanbans.length > RECENT_KANBANS_MAX_SIZE) {
      this.kanbans.pop();
    }
  }

  async save() {
    const value = JSON.stringify(this.kanbans)
    const storedKanbans = JSON.stringify(await joplin.settings.value(RECENT_KANBANS_STORAGE_KEY));
    if (storedKanbans !== value) {
        await joplin.settings.setValue(RECENT_KANBANS_STORAGE_KEY, value);
    }
  }
}