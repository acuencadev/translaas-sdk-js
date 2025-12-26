import type { ITranslaasClient } from './types';
import type { TranslaasOptions } from '@translaas/models';

/**
 * Translaas HTTP client implementation
 */
export class TranslaasClient implements ITranslaasClient {
  constructor(private options: TranslaasOptions) {}

  async getEntryAsync(
    group: string,
    entry: string,
    lang: string,
    number?: number,
    parameters?: Record<string, string>,
    cancellationToken?: AbortSignal
  ): Promise<string> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async getGroupAsync(
    project: string,
    group: string,
    lang: string,
    format?: string,
    cancellationToken?: AbortSignal
  ): Promise<any> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async getProjectAsync(
    project: string,
    lang: string,
    format?: string,
    cancellationToken?: AbortSignal
  ): Promise<any> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async getProjectLocalesAsync(
    project: string,
    cancellationToken?: AbortSignal
  ): Promise<any> {
    // TODO: Implement
    throw new Error('Not implemented');
  }
}
