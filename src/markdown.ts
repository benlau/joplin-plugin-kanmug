import { BoardState, NoteData } from "./types";
import { LinkParser, LinkType } from "./utils/linkParser";

/**
 * Class for formatting board data as markdown in different formats.
 */
export class MarkdownFormatter {
  linkParser = new LinkParser();

  normalizeColumnTitle(title: string, link?: string): string {
    if (link) {
      const parsedLink = this.linkParser.parse(link);
      if (parsedLink.type === LinkType.NoteLink) {
        return `[${title}](:/${parsedLink.noteId})`;
      }

      return `[${title}](${link})`;
    }
    return title;
  }

  /**
   * Get a markdown table representation of the board as a string.
   *
   * @see https://joplinapp.org/markdown/#tables
   */
  getMdTable(boardState: BoardState): string {
    if (!boardState.columns) return "";

    const separator = "---";
    const colNames = boardState.columns.map((col) =>
      this.normalizeColumnTitle(col.name, col.link),
    );

    const header = `${colNames.join(" | ")}\n`;
    const headerSep = `${colNames.map(() => separator).join(" | ")}\n`;

    const rows: string[][] = [];
    const numRows = Math.max(...boardState.columns.map((c) => c.notes.length));
    for (let i = 0; i < numRows; i++) {
      rows[i] = boardState.columns.map((col) => this.getMdLink(col.notes[i]));
    }

    const body = `${rows.map((r) => `| ${r.join(" | ")} |`).join("\n")}\n`;
    const timestamp = `_Last updated at ${new Date().toLocaleString()} by Kanban plugin_`;

    return header + headerSep + body + timestamp;
  }

  /**
   * Get a markdown list representation of the board as a string.
   *
   * @see https://github.com/joplin/plugin-kanban/pull/19
   */
  getMdList(boardState: BoardState): string {
    if (!boardState.columns) return "";

    const numCols = boardState.columns.length;
    const cols: string[] = [];
    for (let i = 0; i < numCols; i++) {
      cols[i] = `## ${this.normalizeColumnTitle(
        boardState.columns[i].name,
        boardState.columns[i].link,
      )}\n${boardState.columns[i].notes
        .map((note) => `- ${this.getMdLink(note)}`)
        .join("\n")}`;
    }

    const body = cols.join("\n\n");
    const timestamp = `\n\n_Last updated at ${new Date().toLocaleString()} by Kanban plugin_`;

    return body + timestamp;
  }

  /**
   * Get a markdown link to the given note as a string.
   *
   * @see https://github.com/joplin/plugin-kanban/pull/19
   */
  getMdLink(note: NoteData): string {
    if (note?.title !== undefined && note?.id !== undefined) {
      // Escape pipe characters in the title
      const escapedTitle = note.title.replace(/\|/g, "\\|");
      return `[${escapedTitle}](:/${note.id})`;
    }
    return "";
  }
}
