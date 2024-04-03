import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate} at ${time}`;
}

// 
export const multiFormatDateString = (timestamp: string = ""): string => {
  const timestampNum = Math.round(new Date(timestamp).getTime() / 1000);
  const date: Date = new Date(timestampNum * 1000);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = diff / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  // Handle days
  if (Math.floor(diffInDays) >= 30) {
    return formatDateString(timestamp); // Assuming formatDateString is defined elsewhere
  } else if (Math.floor(diffInDays) === 1) {
    return "1 day ago";
  } else if (Math.floor(diffInDays) > 1 && diffInDays < 30) {
    return `${Math.floor(diffInDays)} days ago`;
  }

  // Handle hours
  if (Math.floor(diffInHours) === 1) {
    return "1 hour ago";
  } else if (Math.floor(diffInHours) > 1) {
    return `${Math.floor(diffInHours)} hours ago`;
  }

  // Handle minutes
  if (Math.floor(diffInMinutes) === 1) {
    return "1 minute ago";
  } else if (Math.floor(diffInMinutes) > 1) {
    return `${Math.floor(diffInMinutes)} minutes ago`;
  }

  // Less than a minute
  return "Just now";
};

export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};