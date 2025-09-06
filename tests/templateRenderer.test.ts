import { DateTime } from "luxon";
import { TemplateRenderer } from "../src/utils/templateRenderer";

describe("TemplateRenderer", () => {
  let luxonNowSpy: jest.SpyInstance;

  beforeEach(() => {
    luxonNowSpy = jest.spyOn(DateTime, "now").mockImplementation(() => {
      const date = DateTime.fromISO("2025-01-31T00:00:00.000Z").startOf("day");
      return date as DateTime<true>;
    });
  });

  afterEach(() => {
    luxonNowSpy.mockRestore();
  });

  describe("today() function", () => {
    it("should render current date in default format", () => {
      const template = "<%= today() %>";
      const renderer = new TemplateRenderer(template);
      expect(renderer.render()).toBe("2025-01-31");
    });

    it("should render current date with custom format", () => {
      const template = '<%= today().format("MM/dd") %>';
      const renderer = new TemplateRenderer(template);
      expect(renderer.render()).toBe("01/31");
    });

    it('should add one day when delta is "1d"', () => {
      const template = '<%= today().add("1d").format("yyyy-MM-dd") %>';
      const renderer = new TemplateRenderer(template);
      expect(renderer.render()).toBe("2025-02-01");
    });

    it('should add one hour when delta is "1h"', () => {
      const template = '<%= today().add("1h").format("HH:mm") %>';
      const renderer = new TemplateRenderer(template);
      expect(renderer.render()).toBe("01:00");
    });

    it("should handle negative deltas", () => {
      const template = '<%= today().add("-1d") %>';
      const renderer = new TemplateRenderer(template);
      expect(renderer.render()).toBe("2025-01-30");
    });
  });

  describe("template rendering", () => {
    it("should render static text unchanged", () => {
      const template = "New Task";
      const renderer = new TemplateRenderer(template);
      expect(renderer.render()).toBe("New Task");
    });

    it("should render template with date", () => {
      const template = 'New Task <%= today().add("1d").format("MM/dd") %>';
      const renderer = new TemplateRenderer(template);
      expect(renderer.render()).toBe("New Task 02/01");
    });

    it("should handle multiple template expressions", () => {
      const template =
        '[<%= today() %>] Task due <%= today().add("7d").format("MM/dd") %>';
      const renderer = new TemplateRenderer(template);
      expect(renderer.render()).toBe("[2025-01-31] Task due 02/07");
    });

    it("error for invalid template syntax", () => {
      const template = "<%= invalid syntax %>";
      const renderer = new TemplateRenderer(template);
      expect(renderer.render()).toBe(`\
SyntaxError: missing ) after argument list while compiling ejs

If the above error is not helpful, you may want to try EJS-Lint:
https://github.com/RyanZim/EJS-Lint
Or, if you meant to create an async function, pass \`async: true\` as an option.`);
    });

    it("error for invalid delta format", () => {
      const template = '<%= today().add("invalid") %>';
      const renderer = new TemplateRenderer(template);
      expect(renderer.render()).toBe(
        `\
Error: ejs:1
 >> 1| <%= today().add("invalid") %>

Unknown duration argument undefined of type undefined`,
      );
    });
  });
});
