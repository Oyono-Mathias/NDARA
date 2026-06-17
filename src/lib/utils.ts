import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function formatImageUrl(url: string | undefined): string {
  if (!url) return "";
  if (url.includes("r2.cloudflarestorage.com")) {
      try {
          const parsed = new URL(url);
          const pathParts = parsed.pathname.split("/").filter(Boolean);
          if (pathParts[0] === "ndara-bucket") pathParts.shift();
          return `/api/storage/file/${pathParts.join("/")}`;
      } catch(e) {}
  }
  return url;
}

export function cn(...inputs: ClassValue[]) {

  return twMerge(clsx(inputs));
}
