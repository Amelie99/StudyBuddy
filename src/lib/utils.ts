import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// List of approved domains for user-provided avatars
const approvedHosts = [
  'i.imgur.com', 
  'firebasestorage.googleapis.com', 
  'lh3.googleusercontent.com' // for Google Sign-in Avatars
];

/**
 * A utility to ensure avatar URLs are from approved hosts and provides a fallback.
 * If the URL is invalid or from an unapproved host, it returns a placeholder from ui-avatars.com.
 * @param url The original avatar URL.
 * @param name The name to use for generating the placeholder avatar with initials.
 * @returns A safe and appropriate avatar URL.
 */
export const getSafeAvatar = (url?: string, name: string = 'User'): string => {
  try {
    if (url) {
      const parsedUrl = new URL(url);
      if (approvedHosts.includes(parsedUrl.hostname)) {
        return url; // Return the original URL if the host is approved
      }
    }
  } catch (_e) {
    // The URL is invalid, so we'll fall through to the placeholder.
  }
  
  // If no URL or if the host is not approved, generate a placeholder.
  // The name is encoded to ensure it's URL-safe.
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};
