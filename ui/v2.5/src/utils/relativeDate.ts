export const regexRelativeDate = (string: string | undefined) => {
  const matchResult = string?.match(
    /^today(?:\s(-?\d+)\s(days|months|years))?$/
  );
  return matchResult;
};
