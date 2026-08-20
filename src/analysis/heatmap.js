export function bucketCommitsByDate(commitActivityArrays) {
  // commitActivityArrays = array of per-repo commit_activity responses (each an array of 52 weeks)
  const dateMap = {}; // 'YYYY-MM-DD' -> count

  for (const weeks of commitActivityArrays) {
    if (!Array.isArray(weeks)) continue;
    for (const week of weeks) {
      const weekStart = new Date(week.week * 1000);
      week.days.forEach((count, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        dateMap[key] = (dateMap[key] || 0) + count;
      });
    }
  }
  return dateMap;
}
export function computeStreaks(dateMap) {
  const dates = Object.keys(dateMap)
    .filter((d) => dateMap[d] > 0)
    .sort();

  let longest = 0;
  let running = 0;
  let prevDate = null;

  for (const dateStr of dates) {
    const curDate = new Date(dateStr);
    if (prevDate) {
      const diffDays = Math.round((curDate - prevDate) / 86400000);
      if (diffDays === 1) {
        running += 1;
      } else {
        running = 1; // reset streak, but this day itself starts a new one
      }
    } else {
      running = 1;
    }
    longest = Math.max(longest, running);
    prevDate = curDate;
  }

  let current = 0;
  let cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (dateMap[key] > 0) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return { longest, current };
}