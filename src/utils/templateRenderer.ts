// @ts-expect-error ejs is not typed
import ejs from "ejs/ejs.min.js";
import { DateTime as LuxonDateTime } from "luxon";
import ms from "ms";

class DateTime {
  date: LuxonDateTime;

  private _format: string;

  constructor() {
    this.date = LuxonDateTime.now();
    this._format = "yyyy-MM-dd";
  }

  add(delta: string) {
    this.date = this.date.plus(ms(delta as ms.StringValue));
    return this;
  }

  toString() {
    return this.date.toFormat(this._format ?? "yyyy-MM-dd");
  }

  format(format: string) {
    this._format = format;
    return this;
  }
}

export class TemplateRenderer {
  private template: string;

  private data: object;

  constructor(template: string, data?: object) {
    this.template = template;
    this.data = data ?? {};
  }

  today() {
    return new DateTime().format("yyyy-MM-dd");
  }

  render() {
    try {
      const compiledTemplate = ejs.compile(this.template, this.data);
      return compiledTemplate({
        today: () => this.today(),
      });
    } catch (error) {
      if (error instanceof Error) {
        return error.toString();
      }
      return "Error rendering template";
    }
  }
}
