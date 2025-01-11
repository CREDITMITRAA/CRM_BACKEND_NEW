function toUTCFormat(dateString, timeString = "00:00:00") {
    // Combine date and time strings
    const fullDateTime = `${dateString}T${timeString}Z`;
    // Create a Date object
    const date = new Date(fullDateTime);
    
    // Format date and time in UTC
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    // Return formatted UTC string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
    toUTCFormat
}