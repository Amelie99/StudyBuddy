import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const approvedHosts = ['i.imgur.com', 'placehold.co', 'firebasestorage.googleapis.com'];
/**
 * A utility function to ensure avatar URLs are from approved hosts.
 * If the URL is invalid or from an unapproved host, it returns a placeholder.
 * @param url The original avatar URL.
 * @param placeholderSize The size of the placeholder image, e.g., '40x40'.
 * @returns A safe avatar URL.
 */
export const getSafeAvatar = (url?: string, placeholderSize: string = '48x48') => {
    try {
        if (!url) return `https://placehold.co/${placeholderSize}.png`;
        const hostname = new URL(url).hostname;
        return approvedHosts.includes(hostname) ? url : `https://placehold.co/${placeholderSize}.png`;
    } catch (_e) {
        return `https://placehold.co/${placeholderSize}.png`;
    }
};
