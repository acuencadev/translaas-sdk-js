/**
 * ParameterReplacer utility class that replaces placeholders in translation strings
 * with actual parameter values. Supports multiple placeholder formats for compatibility
 * with different translation systems.
 *
 * Supported formats (in order of preference):
 * - `{{name}}` - Preferred format (double curly braces)
 * - `{name}` - Fallback format (single curly braces)
 * - `%name%` - Legacy format (percent signs)
 *
 * @example
 * ```typescript
 * ParameterReplacer.replace('Hello {{name}}!', { name: 'World' }); // 'Hello World!'
 * ParameterReplacer.replace('Hello {name}!', { name: 'World' }); // 'Hello World!'
 * ParameterReplacer.replace('Hello %name%!', { name: 'World' }); // 'Hello World!'
 * ParameterReplacer.replace('Count: {{count}} items', { count: '5' }); // 'Count: 5 items'
 * ```
 */
export class ParameterReplacer {
  /**
   * Escapes special regex characters in a string to make it safe for use in regex patterns
   * @param str String to escape
   * @returns Escaped string safe for regex
   */
  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Replaces placeholders in a translation string with actual parameter values.
   * Supports multiple placeholder formats: {{name}}, {name}, and %name%.
   *
   * Replacement order (important to avoid conflicts):
   * 1. {{name}} format (double curly braces) - preferred
   * 2. {name} format (single curly braces) - fallback
   * 3. %name% format (percent signs) - legacy
   *
   * @param text Translation string containing placeholders
   * @param parameters Object containing parameter values keyed by parameter name
   * @returns String with placeholders replaced by parameter values
   *
   * @example
   * ```typescript
   * // Basic replacement
   * ParameterReplacer.replace('Hello {{name}}!', { name: 'World' });
   * // Returns: 'Hello World!'
   *
   * // Multiple occurrences
   * ParameterReplacer.replace('{{greeting}}, {{name}}!', { greeting: 'Hi', name: 'Alice' });
   * // Returns: 'Hi, Alice!'
   *
   * // Multiple formats (order matters)
   * ParameterReplacer.replace('{{a}} {b} %c%', { a: '1', b: '2', c: '3' });
   * // Returns: '1 2 3'
   *
   * // Empty parameters returns original text
   * ParameterReplacer.replace('Hello {{name}}!', {});
   * // Returns: 'Hello {{name}}!'
   *
   * // Special characters in placeholders are escaped
   * ParameterReplacer.replace('Price: {{price}}', { price: '$10.99' });
   * // Returns: 'Price: $10.99'
   * ```
   */
  static replace(text: string, parameters: Record<string, string> = {}): string {
    // Early return if no parameters provided
    if (!parameters || Object.keys(parameters).length === 0) {
      return text;
    }

    let result = text;

    // Replace {{name}} format first (preferred, double curly braces)
    // This must be done first to avoid conflicts with {name} format
    for (const [key, value] of Object.entries(parameters)) {
      const escapedKey = this.escapeRegex(key);
      const pattern = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g');
      result = result.replace(pattern, value);
    }

    // Replace {name} format second (fallback, single curly braces)
    // Only replace if not already part of {{name}} format
    for (const [key, value] of Object.entries(parameters)) {
      const escapedKey = this.escapeRegex(key);
      // Match {name} but not {{name}} - use negative lookbehind and lookahead
      const pattern = new RegExp(`(?<!\\{)\\{${escapedKey}\\}(?!\\})`, 'g');
      result = result.replace(pattern, value);
    }

    // Replace %name% format third (legacy, percent signs)
    for (const [key, value] of Object.entries(parameters)) {
      const escapedKey = this.escapeRegex(key);
      const pattern = new RegExp(`%${escapedKey}%`, 'g');
      result = result.replace(pattern, value);
    }

    return result;
  }
}
