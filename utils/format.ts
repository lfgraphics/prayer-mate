export const formatToDate = (hours: number | undefined, minutes: number | undefined) => {
    const date = new Date();
    hours = hours ?? 0;
    date.setHours(hours, minutes, 0, 0); // set seconds and ms to 0
    return date;
};

export function convertToAmPm(time: string): string {
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // convert hour to 12-hour format (0 => 12)

    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');

    return `${formattedHour}:${formattedMinute} ${ampm}`;
}


/**
 * Formats a Date object to a time string in HH:MM format
 * @param date The Date object to format
 * @returns A string in HH:MM format
 */
export function formatTimeToHHMM(date?: Date): string {
  if (!date) return '';
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}
