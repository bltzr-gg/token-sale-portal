import { intervalToDuration } from "date-fns";

export const getDurationBetweenDates = (start: Date, end: Date) => {
  const duration = intervalToDuration({ end, start });

  const parts = [];
  if (duration.years && duration.years > 0)
    parts.push(`${duration.years} years`);
  if (duration.months && duration.months > 0)
    parts.push(`${duration.months} months`);
  if (duration.days && duration.days > 0) parts.push(`${duration.days} days`);
  if (duration.hours && duration.hours > 0)
    parts.push(`${duration.hours} hours`);
  return parts.join(", ");
};
