import { Command } from "./commands";
import { UpdateQuery } from "./types";

export type PostProcessingRuleState = {
  updates: UpdateQuery[];
  commands: Command[];
};

export type PostProcessingRule = {
  process(state: PostProcessingRuleState): PostProcessingRuleState;
};

export class DisableToPutParentIdToEmpty implements PostProcessingRule {
  static readonly ERROR_MESSAGE =
    "Can't move note out of any folder. Please review your kanban rules.";

  process(state: PostProcessingRuleState): PostProcessingRuleState {
    const newState = { ...state };

    const updatedNoteLastParentId = {} as Record<string, string>;
    let hasForbiddenUpdate = false;

    state.updates.forEach((update: any) => {
      try {
        const { path } = update;
        if (path[0] !== "notes") {
          return;
        }
        const noteId = path[1];
        if (update.type === "put" && update.body?.parent_id != null) {
          updatedNoteLastParentId[noteId] = update.body.parent_id;
        }
      } catch {}
    });

    for (const noteId in updatedNoteLastParentId) {
      const parentId = updatedNoteLastParentId[noteId];
      if (parentId === "") {
        hasForbiddenUpdate = true;
      }
    }

    if (hasForbiddenUpdate) {
      newState.updates = [];
      newState.commands.push({
        type: "showBanner",
        messages: [
          {
            id: "disable-to-put-parent-id-to-empty",
            title: DisableToPutParentIdToEmpty.ERROR_MESSAGE,
            severity: "warning",
            actions: ["clear"],
            details: "",
          },
        ],
      });
    } else {
      newState.updates = state.updates.filter((update: any) => {
        // Remove immediate updates that would move the note out of any folder
        try {
          return !(update.type === "put" && update.body.parent_id === "");
        } catch {
          return true;
        }
      });
    }
    return newState;
  }
}
