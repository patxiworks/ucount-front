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


export function isTimeBetween(target, start, end) {
  // Parse the times into Date objects
  const [targetHours, targetMinutes] = target.split(':').map(Number);
  const [startHours, startMinutes] = start.split(':').map(Number);
  const [endHours, endMinutes] = end.split(':').map(Number);

  const targetTime = new Date(0, 0, 0, targetHours, targetMinutes);
  const startTime = new Date(0, 0, 0, startHours, startMinutes);
  const endTime = new Date(0, 0, 0, endHours, endMinutes);

  // Check if target time is within the range
  return targetTime >= startTime && targetTime <= endTime;
}