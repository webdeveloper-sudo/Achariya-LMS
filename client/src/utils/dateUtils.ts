/**
 * Get today's date in IST (Indian Standard Time) as YYYY-MM-DD string
 */
export const getTodayIST = (): string => {
  // Adjust for IST (UTC+5:30) if environment is UTC, but for client-side JS,
  // it usually uses local time. If we want strict IST regardless of user location:
  // This is a simple approximation. For strict timezone handling, libraries like date-fns-tz are better.
  // However, for this simple heatmap, local date string is usually sufficient or
  // if we really want to force IST offset:

  // Create date object for current time
  const date = new Date();

  // Add 5.5 hours to UTC to get IST roughly if we were working with UTC dates,
  // but browsers render local time.
  // Let's just return standard ISO date part for consistency with backend logging which might be UTC.
  // Or if the app is Indian-centric, we might want to shift it.

  // For now, let's return standard YYYY-MM-DD of the current user's local time
  // to match the "Activity Log" which likely saves dates based on server time (usually UTC) or writes ISO strings.
  // The heatmap expects YYYY-MM-DD.

  return date.toISOString().split("T")[0];
};

/**
 * Format a YYYY-MM-DD string to a readable format (e.g., "Jan 1, 2024")
 * @param dateStr YYYY-MM-DD
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
