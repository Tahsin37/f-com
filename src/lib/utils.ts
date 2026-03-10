import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStoreUrl(slug: string): string {
  if (typeof window === "undefined") return `/store/${slug}`;
  const host = window.location.host;
  const protocol = window.location.protocol;
  // If we are on localhost, root domain is localhost:3000 or 3006
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return `${protocol}//${slug}.${host}/`;
  }
  // Production (e.g. f-manager.com)
  return `${protocol}//${slug}.${host.replace(/:\d+$/, "")}/`;
}
