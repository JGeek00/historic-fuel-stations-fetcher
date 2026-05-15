import { DateTime } from "luxon";

export const formatDateForDatabase = (date: string) => {
  const dateTime = DateTime.fromISO(date)
  return `${dateTime.year}-${dateTime.month}-${dateTime.day}`
}