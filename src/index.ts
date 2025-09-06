import joplin from "api";

import { SettingItemType } from "api/types";

import type { Action } from "./actions";
import { JoplinService } from "./services/joplinService";
import { RECENT_KANBANS_STORAGE_KEY } from "./recentKanbanStore";
import { KanbanApp } from "./kanbanApp";

const joplinService = new JoplinService();
joplinService.start();

const kanbanApp = new KanbanApp(joplinService);

let boardView: string | undefined;

async function createBoard() {
  if (!boardView) {
    boardView = await joplin.views.panels.create("kanban");
    kanbanApp.boardView = boardView;
    const html = `
      <template id="date-fmt">${await joplin.settings.globalValue(
        "dateFormat",
      )}</template>
      <div id="root"></div>
      <div id="menu-root"></div>
    `;
    await joplin.views.panels.setHtml(boardView, html);
    await joplin.views.panels.addScript(boardView, "gui/main.css");
    await joplin.views.panels.addScript(boardView, "gui/index.js");
    joplin.views.panels.onMessage(boardView, (msg: Action) =>
      kanbanApp.handleKanbanMessage(msg),
    );
  }
}

joplin.plugins.register({
  async onStart() {
    createBoard();

    joplin.workspace.onNoteSelectionChange(
      async ({ value }: { value: [string?] }) => {
        const newNoteId = value?.[0] as string;
        if (newNoteId) kanbanApp.handleNewlyOpenedNote(newNoteId);
      },
    );

    joplin.workspace.onNoteChange(async ({ id }) => {
      await kanbanApp.handleNoteChange(id);
    });

    const settings = {
      [RECENT_KANBANS_STORAGE_KEY]: {
        value: [],
        type: SettingItemType.Object,
        public: false,
        label: "Recent Kanbans",
        section: "kanmug",
      },
    };

    await joplin.settings.registerSettings(settings);
    await kanbanApp.load();
  },
});
