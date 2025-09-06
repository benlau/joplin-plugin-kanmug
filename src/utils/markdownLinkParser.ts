interface MarkdownLink {
  title: string;
  url: string;
}

export class MarkdownLinkParser {
  private static readonly MARKDOWN_LINK_REGEX = /^\[([^\]]+)\]\(([^)]+)\)$/;

  public parse(text: string): MarkdownLink | undefined {
    const match = text.trim().match(MarkdownLinkParser.MARKDOWN_LINK_REGEX);

    if (!match) {
      return undefined;
    }

    const [_, title, url] = match;

    return {
      title: title.trim(),
      url: url.trim(),
    };
  }
}
