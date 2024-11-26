export function timeToSeconds(hours: number, minutes: number) {
  return hours * 3600 + minutes * 60;
}

export function secondsToTime(seconds: number) {
  const hour = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds % 3600) / 60);

  return {
    hour,
    minute,
  };
}
