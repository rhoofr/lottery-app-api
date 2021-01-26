const isValidDate = (d) => d instanceof Date && !Number.isNaN(d);

exports.allNumbersValid = (nbrs) => {
  // all numbers greater than zero
  const allGreaterThanZero = nbrs.every((e) => e > 0);
  if (!allGreaterThanZero) return false;

  // check for duplicates and if each number is greater than the last
  let value = 0;
  for (let i = 0; i < nbrs.length; i++) {
    if (!(nbrs[i] > value)) return false;
    value = nbrs[i];
  }
  // Made it here so valid.
  return true;
};

exports.datesValidForGame = (game, startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  if (startDate.valueOf() > endDate.valueOf()) return false;

  if (game === 'P') {
    const startDay = startDate.getDay();
    const endDay = endDate.getDay();
    // Sunday - Saturday : 0 - 6
    if (startDay !== 3 && startDay !== 6) return false;
    if (endDay !== 3 && endDay !== 6) return false;
  }

  if (game === 'M') {
    const startDay = startDate.getDay();
    const endDay = endDate.getDay();
    // Sunday - Saturday : 0 - 6
    if (startDay !== 2 && startDay !== 5) return false;
    if (endDay !== 2 && endDay !== 5) return false;
  }

  return true;
};
