const DefaultTimeout = 3000;

const DefaultInterval = 100;

export async function sleep(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function tryWaitUntilTimeout(
  condition: () => Promise<boolean>,
  timeout: number = DefaultTimeout,
  interval: number = DefaultInterval,
) {
  const start = Date.now();
  while (!(await condition())) {
    if (Date.now() - start > timeout) {
      throw new Error("Timeout");
    }
    await sleep(interval);
  }
}
