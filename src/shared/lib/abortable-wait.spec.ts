import { describe, expect, it, vi } from 'vitest';
import { abortableWait, isAbortError } from './abortable-wait';

describe('abortableWait', () => {
  it('resolves after delay', async () => {
    vi.useFakeTimers();
    const pending = abortableWait(100);
    await vi.advanceTimersByTimeAsync(100);
    await expect(pending).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it('rejects when aborted before start', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(abortableWait(100, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  it('rejects when aborted during wait', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const pending = abortableWait(1000, controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    vi.useRealTimers();
  });
});

describe('isAbortError', () => {
  it('detects AbortError', () => {
    expect(isAbortError(new DOMException('Aborted', 'AbortError'))).toBe(true);
    expect(isAbortError(new Error('nope'))).toBe(false);
  });
});
