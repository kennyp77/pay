export const removeUrlProtocol = (url: string) => {
  return url.replace(/https?:\/\//, '');
};

export const toTextMask = (value: string, length = 3): string => {
  const reg = new RegExp('.{' + length + '}', 'g');

  return value.replace(reg, (v) => `${v} `).trim();
};

export const toOgrnMask = (value: string): string => {
  return `${value.substring(0, 3)} ${toTextMask(
    value.substring(3, value.length),
    4,
  )}`;
};

const MONTH_NAMES = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июня',
  'июля',
  'авг',
  'сент',
  'окт',
  'ноя',
  'дек',
];

export const getDate = (value: number | string) => {
  const date = new Date(value);
  return `${date.getDate()} ${
    MONTH_NAMES[date.getMonth()]
  } ${date.getFullYear()}`;
};

export const getDatetime = (value: number | string) => {
  const date = new Date(value);
  const timeString = date.toLocaleTimeString('ru', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date.getDate()} ${
    MONTH_NAMES[date.getMonth()]
  } ${date.getFullYear()}, ${timeString}`;
};
