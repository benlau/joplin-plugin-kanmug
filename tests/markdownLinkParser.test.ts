import { MarkdownLinkParser } from "../src/utils/markdownLinkParser";

describe("MarkdownLinkParser", () => {
  const markdownLinkParser = new MarkdownLinkParser();

  it("should parse valid markdown link", () => {
    const input = "  [Link](:/0123456789abcdef0123456789abcdef)  ";
    const result = markdownLinkParser.parse(input);

    expect(result).toEqual({
      title: "Link",
      url: ":/0123456789abcdef0123456789abcdef",
    });
  });

  it("should parse link with spaces in title", () => {
    const input = "[My Link Title](http://example.com)";
    const result = markdownLinkParser.parse(input);

    expect(result).toEqual({
      title: "My Link Title",
      url: "http://example.com",
    });
  });

  it("should return undefined for invalid markdown link", () => {
    const invalidInputs = [
      "Invalid text",
      "[Broken link",
      "Link](http://example.com)",
      "[](http://example.com)",
      "[Link]()",
      "Hello [Link](http://example.com)",
      "",
    ];

    invalidInputs.forEach((input) => {
      const result = markdownLinkParser.parse(input);
      expect(result).toBeUndefined();
    });
  });

  it("should trim whitespace from title and url", () => {
    const input = "[  Link  ](  http://example.com  )";
    const result = markdownLinkParser.parse(input);

    expect(result).toEqual({
      title: "Link",
      url: "http://example.com",
    });
  });
});
