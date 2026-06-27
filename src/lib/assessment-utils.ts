/**
 * Utility functions for assessment ID generation and management
 */

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20); // Limit to 20 characters
}

/**
 * Generate a random alphanumeric string
 */
export function generateRandomId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a unique assessment ID
 * Format: {type}-{slug}-{random}
 * Examples:
 *   - gen-frontend-x7k9w2
 *   - skill-react-a3m7n1
 */
export function generateAssessmentId(
  title: string,
  type: 'general' | 'skill' | 'related_skill',
): string {
  const typePrefix =
    type === 'general' ? 'gen' : type === 'related_skill' ? 'rel' : 'skill';
  const slug = generateSlug(title);
  const random = generateRandomId(6);

  return `${typePrefix}-${slug}-${random}`;
}

/**
 * Parse assessment ID to extract type and slug
 */
export function parseAssessmentId(id: string): {
  type: 'general' | 'skill' | 'related_skill';
  slug: string;
  random: string;
} | null {
  const parts = id.split('-');

  if (parts.length < 3) return null;

  const typePrefix = parts[0];
  const type =
    typePrefix === 'gen'
      ? 'general'
      : typePrefix === 'rel'
        ? 'related_skill'
        : typePrefix === 'skill'
          ? 'skill'
          : null;

  if (!type) return null;

  const random = parts[parts.length - 1];
  const slug = parts.slice(1, -1).join('-');

  return { type, slug, random };
}

/**
 * Check if an ID is a general assessment
 */
export function isGeneralAssessment(id: string): boolean {
  return id.startsWith('gen-');
}

/**
 * Check if an ID is a skill assessment
 */
export function isSkillAssessment(id: string): boolean {
  return id.startsWith('skill-');
}

/**
 * Check if an ID is a related skill assessment
 */
export function isRelatedSkillAssessment(id: string): boolean {
  return id.startsWith('rel-');
}
