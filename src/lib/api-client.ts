// ThinkPost AI — API Client
// Client-side fetch wrapper that handles the standardized error shape.

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly field?: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.code = error.code;
    this.field = error.field;
  }
}

/**
 * Makes a fetch call to the API and handles errors.
 * Returns the parsed JSON response on success.
 * Throws ApiClientError on failure with exact FRD error messages.
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    if (data?.error) {
      throw new ApiClientError(data.error);
    }
    throw new ApiClientError({
      code: 'SERVER_ERROR',
      message: 'Something went wrong on our end. Please try again in a moment.',
    });
  }

  return data as T;
}
