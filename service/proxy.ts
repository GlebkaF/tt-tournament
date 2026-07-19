import { ProxyAgent, fetch as undiciFetch } from "undici";

let proxiedFetch: typeof fetch | null = null;

/**
 * x260 находится в РФ, поэтому Telegram и OpenAI доступны только через
 * HTTPS_PROXY. Локально, где прокси не задана, остаётся обычный fetch.
 */
export function getExternalFetch(): typeof fetch {
  if (proxiedFetch) return proxiedFetch;

  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (!proxyUrl) {
    proxiedFetch = globalThis.fetch;
    return proxiedFetch;
  }

  const agent = new ProxyAgent(proxyUrl);
  proxiedFetch = ((input: RequestInfo | URL, init?: RequestInit) =>
    undiciFetch(String(input), {
      ...init,
      dispatcher: agent,
    } as Parameters<typeof undiciFetch>[1])) as unknown as typeof fetch;
  console.log("External APIs will use HTTPS_PROXY");
  return proxiedFetch;
}
