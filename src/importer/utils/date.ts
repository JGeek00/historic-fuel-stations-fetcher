import { DateTime } from "luxon";

export const formatDateForDatabase = (date: string | null) => {
  if (!date) return null
  const dateTime = DateTime.fromISO(date)
  return `${dateTime.year}-${dateTime.month}-${dateTime.day}`
}