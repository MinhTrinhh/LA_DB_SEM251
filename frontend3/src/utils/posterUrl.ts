/**
 * Utility functions for handling event poster URLs
 */

const API_BASE_URL = 'http://localhost:20001';
const DEFAULT_POSTER = '/placeholder.svg';

/**
 * Get the full poster URL from a backend poster path
 * @param posterUrl - The poster URL from backend (e.g., "/uploads/posters/uuid.jpg")
 * @returns Full URL to display the poster
 */
export const getPosterUrl = (posterUrl: string | null | undefined): string => {
  // If no poster URL provided, use default
  if (!posterUrl || posterUrl === 'null') {
    return DEFAULT_POSTER;
  }

  // If it's an uploaded file path, prepend backend URL
  if (posterUrl.startsWith('/uploads')) {
    return `${API_BASE_URL}${posterUrl}`;
  }

  // If it's already a full URL or a local path, use as-is
  return posterUrl;
};

/**
 * Get the default poster URL
 */
export const getDefaultPosterUrl = (): string => {
  return DEFAULT_POSTER;
};

/**
 * Check if a poster URL is the default poster
 */
export const isDefaultPoster = (posterUrl: string | null | undefined): boolean => {
  return !posterUrl || posterUrl === 'null' || posterUrl === DEFAULT_POSTER;
};

