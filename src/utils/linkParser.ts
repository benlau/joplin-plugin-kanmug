export enum LinkType {
  HyperLink = "hyperlink",
  NoteLink = "notelink",
  InvalidLink = "invalid",
}

type ParsedLink = {
  type: LinkType;
  noteId?: string;
  url?: string;
};

const NoteIDPattern = /^[a-f0-9]{32}$/;
const ValidSchemes = ["file:", "http:", "https:", "joplin:"];

export class LinkParser {
  parse(link: string): ParsedLink {
    if (!link || typeof link !== "string") {
      return {
        type: LinkType.InvalidLink,
      };
    }

    if (NoteIDPattern.test(link)) {
      return {
        type: LinkType.NoteLink,
        noteId: link,
      };
    }

    try {
      const url = new URL(link);

      if (url.protocol === "joplin:") {
        const noteId = url.searchParams.get("id");
        if (
          noteId &&
          NoteIDPattern.test(noteId) &&
          url.pathname.endsWith("/openNote")
        ) {
          return {
            type: LinkType.NoteLink,
            noteId,
            url: link,
          };
        }
        return {
          type: LinkType.InvalidLink,
        };
      }

      if (ValidSchemes.includes(url.protocol)) {
        return {
          type: LinkType.HyperLink,
          url: link,
        };
      }
    } catch {
      // Ignore invalid URLs
    }

    return {
      type: LinkType.InvalidLink,
    };
  }
}
