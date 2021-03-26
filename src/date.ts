export const isoToDate = (dateStr: string): Date => {
  return new Date(dateStr);
};

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const formatDate = (date: Date) => {
  const month = months[date.getMonth()];
  const day = date.getDate();
  const fday = day < 10 ? `0${day}` : day;
  const year = date.getFullYear();
  return `${month} ${fday}, ${year}`;
};
