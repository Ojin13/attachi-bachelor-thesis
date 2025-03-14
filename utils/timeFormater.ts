/**
 * Function to format a timestamp to a human readable date
 * @param timestamp - The timestamp to format in seconds
 * @param includeHours - If true, the formatted date will include the hours and minutes
 * @returns The formatted date in the format "DD. Month YYYY and HH:MM if includeHours is true"
 */
export function formatTimestamp(timestamp: number, includeHours: boolean = true): string {
    let date = new Date(timestamp * 1000);
    let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let currentMonth = monthNames[date.getMonth()];
    let noteCreationDate = date.getDate() + ". " + currentMonth + " " + date.getFullYear();

    if (includeHours) {
        noteCreationDate += ", " + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    }

    return noteCreationDate;
}

/**
 * Function to format a date to a human readable format
 * @param date - The date to format
 * @returns The formatted date in the format "DD. MM. YYYY"
 */
export function formatDate(date: string) {
    let formattedDate = new Date(date);
    let year = formattedDate.getFullYear();

    // If the publication year is more 3000ad, subtract 1000 years to get the correct year.
    // By doing this we can force some notifications to all users regardless of if they
    // registered before or after the notification was created...
    if (year >= 3000) {
        year -= 1000;
    }

    return formattedDate.getDate() + ". " + (formattedDate.getMonth() + 1) + ". " + year;
}
