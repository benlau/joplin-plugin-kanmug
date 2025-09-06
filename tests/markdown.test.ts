import { MarkdownFormatter } from "../src/markdown";
import { BoardState, NoteData } from "../src/types";

describe("MarkdownFormatter", () => {
  let formatter: MarkdownFormatter;
  let mockDate: jest.SpyInstance;

  // Sample note data for testing
  const sampleNotes: NoteData[] = [
    { id: "note1", title: "Note 1", tags: [] } as unknown as NoteData,
    { id: "note2", title: "Note 2", tags: [] } as unknown as NoteData,
    { id: "note3", title: "Note 3", tags: [] } as unknown as NoteData,
    { id: "note4", title: "Note with | pipe", tags: [] } as unknown as NoteData,
  ];

  // Sample board state for testing
  const sampleBoardState: BoardState = {
    name: "Test Board",
    columns: [
      { name: "To Do", notes: [sampleNotes[0], sampleNotes[3]] },
      { name: "In Progress", notes: [sampleNotes[1]] },
      { name: "Done", notes: [sampleNotes[2]] },
    ],
    messages: [],
    hiddenTags: [],
  };

  beforeEach(() => {
    formatter = new MarkdownFormatter();
    mockDate = jest
      .spyOn(Date.prototype, "toLocaleString")
      .mockReturnValue("2025-01-01 12:00:00");
  });

  afterEach(() => {
    mockDate.mockRestore();
  });

  describe("getMdLink", () => {
    it("should create a markdown link for a valid note", () => {
      const result = formatter.getMdLink(sampleNotes[0]);
      expect(result).toBe("[Note 1](:/note1)");
    });

    it("should escape pipe characters in note titles", () => {
      const result = formatter.getMdLink(sampleNotes[3]);
      expect(result).toBe("[Note with \\| pipe](:/note4)");
    });

    it("should return empty string for undefined note", () => {
      const result = formatter.getMdLink(undefined as unknown as NoteData);
      expect(result).toBe("");
    });

    it("should return empty string for note without title or id", () => {
      const result = formatter.getMdLink({} as NoteData);
      expect(result).toBe("");
    });
  });

  describe("getMdTable", () => {
    it("should create a markdown table for a valid board state", () => {
      const result = formatter.getMdTable(sampleBoardState);
      const expected =
        "To Do | In Progress | Done\n" +
        "--- | --- | ---\n" +
        "| [Note 1](:/note1) | [Note 2](:/note2) | [Note 3](:/note3) |\n" +
        "| [Note with \\| pipe](:/note4) |  |  |\n" +
        "_Last updated at 2025-01-01 12:00:00 by Kanban plugin_";
      expect(result).toBe(expected);
    });

    it("should return empty string for board state without columns", () => {
      const result = formatter.getMdTable({} as BoardState);
      expect(result).toBe("");
    });

    it("should create title with link", () => {
      const boardState = {
        ...sampleBoardState,
        name: "Test Board with link",
        columns: [
          {
            name: "Test",
            link: "joplin://x-callback-url/openNote?id=8587ba38240578b2b68a71fbec6aee4e",
            notes: [],
          },
        ],
      };
      const result = formatter.getMdTable(boardState);
      expect(result).toBe(
        "[Test](:/8587ba38240578b2b68a71fbec6aee4e)\n" +
          "---\n" +
          "\n" +
          "_Last updated at 2025-01-01 12:00:00 by Kanban plugin_",
      );
    });
  });

  describe("getMdList", () => {
    it("should create a markdown list for a valid board state", () => {
      const result = formatter.getMdList(sampleBoardState);
      const expected =
        "## To Do\n" +
        "- [Note 1](:/note1)\n" +
        "- [Note with \\| pipe](:/note4)\n" +
        "\n" +
        "## In Progress\n" +
        "- [Note 2](:/note2)\n" +
        "\n" +
        "## Done\n" +
        "- [Note 3](:/note3)\n" +
        "\n" +
        "_Last updated at 2025-01-01 12:00:00 by Kanban plugin_";
      expect(result).toBe(expected);
    });

    it("should return empty string for board state without columns", () => {
      const result = formatter.getMdList({} as BoardState);
      expect(result).toBe("");
    });

    it("should create title with link", () => {
      const boardState = {
        ...sampleBoardState,
        name: "Test Board with link",
        columns: [
          {
            name: "Test",
            link: "joplin://x-callback-url/openNote?id=8587ba38240578b2b68a71fbec6aee4e",
            notes: [],
          },
        ],
      };
      const result = formatter.getMdList(boardState);
      expect(result).toBe(
        "## [Test](:/8587ba38240578b2b68a71fbec6aee4e)\n\n\n" +
          "_Last updated at 2025-01-01 12:00:00 by Kanban plugin_",
      );
    });
  });
});
