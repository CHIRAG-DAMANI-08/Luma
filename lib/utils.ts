import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateText(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export function stripMarkdown(text: string): string {
  // Basic markdown stripping
  return text
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic
    .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Replace links with just the text
    .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Replace images with alt text
    .replace(/(\n|\r)/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Remove extra spaces
    .trim();
}
