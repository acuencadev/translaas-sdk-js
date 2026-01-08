/**
 * EnvironmentDetector utility class that detects the runtime environment
 * (Node.js, Browser, Deno, Bun). This enables the SDK to adapt its behavior
 * based on the execution environment.
 *
 * Detection order (important for SSR and edge cases):
 * 1. Deno - Check for Deno global
 * 2. Bun - Check for Bun global
 * 3. Node.js - Check for process.versions.node
 * 4. Browser - Check for window and document
 * 5. Unknown - Fallback if none match
 *
 * @example
 * ```typescript
 * // Check specific environment
 * if (EnvironmentDetector.isNode()) {
 *   // Node.js specific code
 * }
 *
 * if (EnvironmentDetector.isBrowser()) {
 *   // Browser specific code
 * }
 *
 * // Get runtime name
 * const runtime = EnvironmentDetector.getRuntime();
 * // Returns: 'node' | 'browser' | 'deno' | 'bun' | 'unknown'
 * ```
 */
export class EnvironmentDetector {
  /**
   * Checks if the code is running in a Node.js environment.
   * Detection: Checks for `process.versions.node` which is unique to Node.js.
   * Note: This will return false in SSR scenarios where window might also exist.
   *
   * @returns true if running in Node.js, false otherwise
   */
  static isNode(): boolean {
    return (
      typeof process !== 'undefined' &&
      process.versions != null &&
      typeof process.versions.node !== 'undefined'
    );
  }

  /**
   * Checks if the code is running in a browser environment.
   * Detection: Checks for `window` and `document` globals which are browser-specific.
   * Note: In SSR scenarios, this may return false even if window exists.
   *
   * @returns true if running in a browser, false otherwise
   */
  static isBrowser(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined' &&
      typeof window.document !== 'undefined'
    );
  }

  /**
   * Checks if the code is running in a Deno environment.
   * Detection: Checks for `Deno` global which is unique to Deno runtime.
   *
   * @returns true if running in Deno, false otherwise
   */
  static isDeno(): boolean {
    return typeof Deno !== 'undefined' && Deno != null;
  }

  /**
   * Checks if the code is running in a Bun environment.
   * Detection: Checks for `Bun` global which is unique to Bun runtime.
   *
   * @returns true if running in Bun, false otherwise
   */
  static isBun(): boolean {
    return typeof Bun !== 'undefined' && Bun != null;
  }

  /**
   * Gets the runtime name as a string.
   * Detection order is important: Deno → Bun → Node.js → Browser → Unknown
   * This order ensures correct detection in edge cases (e.g., SSR where multiple
   * globals might exist).
   *
   * @returns Runtime name: 'node' | 'browser' | 'deno' | 'bun' | 'unknown'
   *
   * @example
   * ```typescript
   * const runtime = EnvironmentDetector.getRuntime();
   * switch (runtime) {
   *   case 'node':
   *     // Node.js specific logic
   *     break;
   *   case 'browser':
   *     // Browser specific logic
   *     break;
   *   case 'deno':
   *     // Deno specific logic
   *     break;
   *   case 'bun':
   *     // Bun specific logic
   *     break;
   *   default:
   *     // Unknown environment
   * }
   * ```
   */
  static getRuntime(): 'node' | 'browser' | 'deno' | 'bun' | 'unknown' {
    // Check in order: Deno → Bun → Node.js → Browser → Unknown
    // This order is important for SSR scenarios where multiple globals might exist

    if (this.isDeno()) {
      return 'deno';
    }

    if (this.isBun()) {
      return 'bun';
    }

    if (this.isNode()) {
      return 'node';
    }

    if (this.isBrowser()) {
      return 'browser';
    }

    return 'unknown';
  }
}
