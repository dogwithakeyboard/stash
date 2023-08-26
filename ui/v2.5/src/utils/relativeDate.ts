export const regexRelativeDate = (string: string | undefined) => {
  const matchResult = string?.match(
    /^today(?:,(-?\d+),(days|months|years))?$/
  );
  return matchResult;
};
