// Shared JSON fetch for every provider adapter: timeout, typed errors, no retries.

export class ProviderError extends Error {
  provider: string;
  status: number;
  constructor(provider: string, status: number, message: string) {
    super(message);
    this.provider = provider;
    this.status = status;
  }
}

type Init = RequestInit & { next?: { revalidate?: number | false; tags?: string[] } };

export async function getJson<T = unknown>(provider: string, url: string, init: Init = {}, timeoutMs = 15000): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: init.signal ?? AbortSignal.timeout(timeoutMs) });
  } catch (e) {
    const timedOut = e instanceof DOMException && e.name === "TimeoutError";
    throw new ProviderError(provider, 0, timedOut ? `${provider} took too long to respond.` : `Couldn't reach ${provider}. Check your connection.`);
  }
  if (res.status === 429) throw new ProviderError(provider, 429, `${provider} is rate-limiting requests. Try again in a minute.`);
  if (!res.ok) throw new ProviderError(provider, res.status, `${provider} returned an error (${res.status}).`);
  try {
    return (await res.json()) as T;
  } catch {
    throw new ProviderError(provider, res.status, `${provider} sent a response we couldn't read.`);
  }
}

// Runtime validation helper: fail loudly on unexpected shapes instead of rendering undefined.
export function expect<T>(provider: string, value: T | undefined | null, what: string): T {
  if (value === undefined || value === null) throw new ProviderError(provider, 200, `${provider} response is missing ${what}.`);
  return value;
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong.");
