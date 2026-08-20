import { useEffect } from 'react';
import { aggregateLanguages } from './analysis/languages';
import { computeStreaks } from './analysis/heatmap';

function App() {
  useEffect(() => {
    // Test language aggregation
    const fakeRepos = [
      { languages: { JavaScript: 1000, Python: 500 } },
      { languages: { JavaScript: 500, HTML: 200 } },
    ];
    console.log('Aggregated languages:', aggregateLanguages(fakeRepos));

    // Test streak calculation
    const today = new Date();
    const fmt = (d) => d.toISOString().slice(0, 10);
    const d0 = fmt(today);
    const d1 = fmt(new Date(today - 1 * 86400000));
    const d2 = fmt(new Date(today - 2 * 86400000));
    const d5 = fmt(new Date(today - 5 * 86400000));
    const d6 = fmt(new Date(today - 6 * 86400000));

    const fakeDateMap = {
      [d0]: 2, [d1]: 1, [d2]: 3, // 3-day streak ending today
      [d5]: 1, [d6]: 1,          // separate 2-day streak, broken by a gap
    };
    console.log('Streaks:', computeStreaks(fakeDateMap));
  }, []);

  return (
    <div>
      <h1>GitHub Insights</h1>
    </div>
  );
}

export default App;