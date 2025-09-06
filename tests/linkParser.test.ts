import { LinkType, LinkParser } from "../src/utils/linkParser";

describe("LinkValidator", () => {
  const linkParser = new LinkParser();
  describe("validate", () => {
    test("should identify valid hyperlinks", () => {
      const links = [
        "https://example.com",
        "http://localhost:3000",
        "file:///C:/path/to/file.txt",
        "https://sub.domain.com/path?query=123#fragment",
      ];

      links.forEach((link) => {
        expect(linkParser.parse(link).type).toBe(LinkType.HyperLink);
      });
    });

    test("should identify valid note links", () => {
      const links = [
        "abcdef0123456789abcdef0123456789",
        "0123456789abcdef0123456789abcdef",
      ];

      links.forEach((link) => {
        expect(linkParser.parse(link).type).toBe(LinkType.NoteLink);
      });
    });

    test("should identify invalid links", () => {
      const links = [
        "",
        "not-a-link",
        "abcdef012",
        "abcdef0123456789abcdef0123456789abc",
        "abcdefghijklmnop0123456789abcdef",
        null,
        undefined,
      ];

      links.forEach((link) => {
        expect(linkParser.parse(link as string).type).toBe(
          LinkType.InvalidLink,
        );
      });
    });

    test("should parse joplin external links", () => {
      const noteLink =
        "joplin://x-callback-url/openNote?id=4a0402e5d875cb84e9b70c383e838f37";

      const parsedNoteLink = linkParser.parse(noteLink);
      expect(parsedNoteLink.type).toBe(LinkType.NoteLink);
      expect(parsedNoteLink.noteId).toBe("4a0402e5d875cb84e9b70c383e838f37");

      const noteboookLink =
        "joplin://x-callback-url/openFolder?id=9efd9f49eae74b17bc2165bb565dd18d";
      const parsedNotebookLink = linkParser.parse(noteboookLink);
      expect(parsedNotebookLink.type).toBe(LinkType.InvalidLink);
    });
  });
});
