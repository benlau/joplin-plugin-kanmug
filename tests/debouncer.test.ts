import { Debouncer } from "../src/utils/debouncer";
import { AbortedError } from "../src/types";

describe("Debouncer", () => {
  jest.useFakeTimers();

  it("should debounce function calls", async () => {
    const debouncer = new Debouncer(100);
    const mockFn = jest.fn().mockResolvedValue(42);

    const promise1 = debouncer.debounce(mockFn, 1);
    const promise2 = debouncer.debounce(mockFn, 2);
    const promise3 = debouncer.debounce(mockFn, 3);

    await expect(promise1).rejects.toThrow(AbortedError);
    await expect(promise2).rejects.toThrow(AbortedError);

    jest.advanceTimersByTime(100);

    const result = await promise3;
    expect(result).toBe(42);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenLastCalledWith(3);
  });

  it("should handle function errors", async () => {
    const debouncer = new Debouncer(100);
    const error = new Error("Test error");
    const mockFn = jest.fn().mockRejectedValue(error);

    const promise = debouncer.debounce(mockFn);
    jest.advanceTimersByTime(100);

    await expect(promise).rejects.toThrow(error);
  });

  it("should abort pending calls", async () => {
    const debouncer = new Debouncer(100);
    const mockFn = jest.fn().mockResolvedValue(42);

    const promise = debouncer.debounce(mockFn);
    debouncer.abort();

    await expect(promise).rejects.toThrow(AbortedError);
    expect(mockFn).not.toHaveBeenCalled();
  });
});
