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

  if (dates.length === 0) {
    return { longest: 0, current: 0 };
  }

  // Longest streak anywhere in the history
  let longest = 1;
  let running = 1;
  for (let i = 1; i < dates.length; i++) {
    const diffDays = Math.round((new Date(dates[i]) - new Date(dates[i - 1])) / 86400000);
    running = diffDays === 1 ? running + 1 : 1;
    longest = Math.max(longest, running);
  }

  // Current streak = consecutive days ending at the most recent active date
  let current = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const diffDays = Math.round((new Date(dates[i]) - new Date(dates[i - 1])) / 86400000);
    if (diffDays === 1) {
      current++;
    } else {
      break;
    }
  }

  return { longest, current };
}