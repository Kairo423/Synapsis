export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 2,
  delayMs = 500
): Promise<Response> {
  let lastError: any = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status < 500) {
        return response;
      }
      lastError = new Error(`Server error: ${response.status}`);
    } catch (error: any) {
      lastError = error;
    }
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  throw lastError;
}
