import { AbortedError } from "../types";

export class Debouncer {
  private timer: NodeJS.Timeout | null = null;

  private currentPromise: Promise<any> | null = null;

  private rejectFn: ((reason: any) => void) | null = null;

  private readonly debounceTime: number;

  constructor(debounceTime: number) {
    this.debounceTime = debounceTime;
  }

  async debounce<T>(
    func: (...args: any[]) => Promise<T>,
    ...args: any[]
  ): Promise<T> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.rejectFn?.(new AbortedError());
    }

    return new Promise<T>((resolve, reject) => {
      this.rejectFn = reject;

      this.timer = setTimeout(async () => {
        try {
          this.currentPromise = func(...args);
          const result = await this.currentPromise;
          this.currentPromise = null;
          resolve(result);
        } catch (error) {
          this.currentPromise = null;
          reject(error);
        } finally {
          this.timer = null;
          this.rejectFn = null;
        }
      }, this.debounceTime);
    });
  }

  abort(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      this.rejectFn?.(new AbortedError());
      this.rejectFn = null;
    }
  }
}
