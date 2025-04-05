import { intervalToDuration } from "date-fns";
import { pluralise } from "./pluralise";

export const getDurationBetweenDates = (start: Date, end: Date) => {
  const duration = intervalToDuration({ end, start });

  const parts = [];
  if (duration.years && duration.years > 0) {
    parts.push(
      `${duration.years} ${pluralise(duration.years, "year", "years")}`,
    );
  }
  if (duration.months && duration.months > 0) {
    parts.push(
      `${duration.months} ${pluralise(duration.months, "month", "months")}`,
    );
  }
  if (duration.days && duration.days > 0) {
    parts.push(`${duration.days} ${pluralise(duration.days, "day", "days")}`);
  }
  if (duration.hours && duration.hours > 0) {
    parts.push(
      `${duration.hours} ${pluralise(duration.hours, "hour", "hours")}`,
    );
  }
  if (duration.minutes && duration.minutes > 0) {
    parts.push(
      `${duration.minutes} ${pluralise(duration.minutes, "minute", "minutes")}`,
    );
  }
  if (duration.seconds && duration.seconds > 0) {
    parts.push(
      `${duration.seconds} ${pluralise(duration.seconds, "second", "seconds")}`,
    );
  }
  return parts.join(", ");
};
