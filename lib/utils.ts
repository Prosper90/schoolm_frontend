import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("en-US", options || defaultOptions);
}

export function formatCurrency(amount: number, currency: string = "UGX"): string {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    SUPER_ADMIN: "danger",
    SCHOOL_ADMIN: "primary",
    TEACHER: "success",
    ACCOUNTANT: "warning",
    SECRETARY: "info",
    STUDENT: "secondary",
    COOK: "default",
    OTHER_STAFF: "default",
  };
  return colors[role] || "default";
}

export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: "success",
    INACTIVE: "danger",
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
    PRESENT: "success",
    ABSENT: "danger",
    LATE: "warning",
    EXCUSED: "info",
  };
  return colors[status] || "default";
}
