import type { ITranslaasClient } from './types';
import type { TranslaasOptions } from '@translaas/models';
import {
  TranslaasApiException,
  TranslationGroup,
  TranslationProject,
  ProjectLocales,
} from '@translaas/models';

/**
 * Translaas HTTP client implementation
 */
export class TranslaasClient implements ITranslaasClient {
  constructor(private options: TranslaasOptions) {
    if (!options.apiKey) {
      throw new Error('API key is required');
    }
    if (!options.baseUrl) {
      throw new Error('Base URL is required');
    }
  }

  /**
   * Builds query parameters from an object
   */
  private buildQueryParams(params: Record<string, string | number | undefined>): URLSearchParams {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParams.set(key, value.toString());
      }
    }
    return queryParams;
  }

  /**
   * Creates an AbortSignal with timeout if timeout is configured
   */
  private createAbortSignal(cancellationToken?: AbortSignal): AbortSignal | undefined {
    if (!this.options.timeout) {
      return cancellationToken;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

    // If a cancellation token is provided, abort when it's aborted
    if (cancellationToken) {
      cancellationToken.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        controller.abort();
      });
    } else {
      // Clean up timeout when signal is aborted
      controller.signal.addEventListener('abort', () => clearTimeout(timeoutId));
    }

    return controller.signal;
  }

  /**
   * Handles API errors and throws appropriate exceptions
   */
  private async handleApiError(response: Response): Promise<never> {
    let errorMessage = `API request failed: ${response.statusText}`;
    let responseBody: string | undefined;

    try {
      responseBody = await response.text();
      if (responseBody) {
        // Try to parse as JSON for better error messages
        try {
          const json = JSON.parse(responseBody);
          if (json.message || json.error) {
            errorMessage = json.message || json.error || errorMessage;
          }
        } catch {
          // If not JSON, use the text as-is
          errorMessage =
            responseBody.length > 200 ? `${errorMessage} (response too long)` : responseBody;
        }
      }
    } catch {
      // Ignore errors when reading response body
    }

    throw new TranslaasApiException(errorMessage, response.status);
  }

  /**
   * Makes an HTTP request with proper error handling
   */
  private async makeRequest(
    endpoint: string,
    queryParams: URLSearchParams,
    acceptHeader: string,
    cancellationToken?: AbortSignal
  ): Promise<Response> {
    const url = `${this.options.baseUrl}${endpoint}?${queryParams.toString()}`;
    const signal = this.createAbortSignal(cancellationToken);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.options.apiKey,
          Accept: acceptHeader,
        },
        signal,
      });

      if (!response.ok) {
        await this.handleApiError(response);
      }

      return response;
    } catch (error) {
      // Handle network errors and abort errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new TranslaasApiException('Request was cancelled or timed out', undefined, error);
        }
        if (error instanceof TranslaasApiException) {
          throw error;
        }
        throw new TranslaasApiException(`Network error: ${error.message}`, undefined, error);
      }
      throw new TranslaasApiException('Unknown error occurred', undefined, error as Error);
    }
  }

  async getEntryAsync(
    group: string,
    entry: string,
    lang: string,
    number?: number,
    parameters?: Record<string, string>,
    cancellationToken?: AbortSignal
  ): Promise<string> {
    const queryParams = this.buildQueryParams({
      group,
      entry,
      lang,
      n: number,
      ...parameters,
    });

    const response = await this.makeRequest(
      '/api/translations/text',
      queryParams,
      'text/plain',
      cancellationToken
    );

    return await response.text();
  }

  async getGroupAsync(
    project: string,
    group: string,
    lang: string,
    format?: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationGroup> {
    const queryParams = this.buildQueryParams({
      project,
      group,
      lang,
      format,
    });

    const response = await this.makeRequest(
      '/api/translations/group',
      queryParams,
      'application/json',
      cancellationToken
    );

    const data = await response.json();
    return new TranslationGroup(data);
  }

  async getProjectAsync(
    project: string,
    lang: string,
    format?: string,
    cancellationToken?: AbortSignal
  ): Promise<TranslationProject> {
    const queryParams = this.buildQueryParams({
      project,
      lang,
      format,
    });

    const response = await this.makeRequest(
      '/api/translations/project',
      queryParams,
      'application/json',
      cancellationToken
    );

    const data = await response.json();
    return new TranslationProject(data);
  }

  async getProjectLocalesAsync(
    project: string,
    cancellationToken?: AbortSignal
  ): Promise<ProjectLocales> {
    const queryParams = this.buildQueryParams({
      project,
    });

    const response = await this.makeRequest(
      '/api/translations/locales',
      queryParams,
      'application/json',
      cancellationToken
    );

    const data = await response.json();
    // Handle both { locales: [...] } and [...] formats
    const locales = Array.isArray(data) ? data : data.locales || [];
    return new ProjectLocales(locales);
  }
}
