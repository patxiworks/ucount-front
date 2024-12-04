// utils/timeCheck.ts

export function isAttendanceTime(startTime, endTime) {
  const now = new Date();
  const nigeriaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Africa/Lagos" })
  );

  // Parse the start and end times
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const eventStart = new Date(nigeriaTime);
  eventStart.setHours(startHour, startMinute, 0);

  const eventEnd = new Date(nigeriaTime);
  eventEnd.setHours(endHour, endMinute, 0);

  // Check if the current time is within the range
  return nigeriaTime >= eventStart && nigeriaTime <= eventEnd;
}


