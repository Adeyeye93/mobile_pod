export const useFormatNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }

  if (num < 1000000) {
    const formatted = Math.round((num / 1000) * 10) / 10;
    return `${formatted}K`;
  }

  if (num < 1000000000) {
    const formatted = Math.round((num / 1000000) * 10) / 10;
    return `${formatted}M`;
  }

  if (num < 1000000000000) {
    const formatted = Math.round((num / 1000000000) * 10) / 10;
    return `${formatted}B`;
  }

  const formatted = Math.round((num / 1000000000000) * 10) / 10;
  return `${formatted}T`;
};

export const useSecondsToHours = (seconds: number): string => {
  const hours = seconds / 3600;

  if (hours < 1) {
    const minutes = Math.round(seconds / 60);
    return `${minutes}m`;
  }

  const rounded = Math.round(hours * 10) / 10;
  if (rounded < 1000) {
    return `${rounded}Hrs`;
  }

  const units = ["K", "M", "B", "T"];
  let unitIndex = 0;
  let formattedHours = rounded;

  while (formattedHours >= 1000 && unitIndex < units.length - 1) {
    formattedHours /= 1000;
    unitIndex++;
  }

  const finalRounded = Math.round(formattedHours * 10) / 10;
  return `${finalRounded}${units[unitIndex]}Hrs`;
};
