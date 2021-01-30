/**
 * Returns a formatted string with the current local time as shown in @return below.
 * @param  Nada
 * @return {String} 'Current Date/Time: 02-09-2020 08:28:21 Local'
 */
exports.getCurrentDateTimeLocal = () => {
  const dt = new Date();
  let currentDate = dt.getDate();
  let currentMonth = dt.getMonth() + 1;
  const currentYear = dt.getFullYear();
  let currentHours = dt.getHours();
  let currentMins = dt.getMinutes();
  let currentSecs = dt.getSeconds();

  // Add 0 before date, month, hrs, mins or secs if they are less than 0
  currentDate = currentDate < 10 ? `0${currentDate}` : currentDate;
  currentMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth;
  currentHours = currentHours < 10 ? `0${currentHours}` : currentHours;
  currentMins = currentMins < 10 ? `0${currentMins}` : currentMins;
  currentSecs = currentSecs < 10 ? `0${currentSecs}` : currentSecs;

  return `${currentMonth}-${currentDate}-${currentYear} ${currentHours}:${currentMins}:${currentSecs} Local`;
};

/**
 * Gets the diffence in days between two dates. Takes out the time component.
 * If we have something like '2020-02-07T00:00:00.000' and '2020-02-08T01:00:00.000'
 * which would return two days (really three) if the time is not taken out.
 * For the purpose of this function if we have the seventh and eigth it will return
 * two days because we need to process something for each day...
 * @param  {Date} firstDt
 * @param  {Date} secondDt
 * @return {Number} Number of days between dates (including the dates themselves)
 */
exports.getDifferenceInDays = (firstDt, secondDt) => {
  if (firstDt.valueOf() > secondDt.valueOf()) return 0;

  // Doing this to take out the time component
  let currentDate = firstDt.getDate();
  let currentMonth = firstDt.getMonth();
  let currentYear = firstDt.getFullYear();

  const dt1 = new Date(currentYear, currentMonth, currentDate);

  currentDate = secondDt.getDate();
  currentMonth = secondDt.getMonth();
  currentYear = secondDt.getFullYear();

  const dt2 = new Date(currentYear, currentMonth, currentDate);

  const diffTime = Math.abs(dt1 - dt2);
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 0) diffDays += 1; // Add one so we include the starting and ending day
  return diffDays;
};
