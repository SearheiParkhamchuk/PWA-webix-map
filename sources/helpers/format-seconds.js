export const formatSeconds = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600) // get hours
  const minutes = Math.floor((totalSeconds - hours * 3600) / 60) // get minutes
  const seconds = totalSeconds - hours * 3600 - minutes * 60
  return { hours, minutes, seconds: Math.round(seconds * 100) / 100 }
}
