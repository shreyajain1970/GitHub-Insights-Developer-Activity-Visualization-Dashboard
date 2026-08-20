import { useState } from 'react';
import UserSearch from './components/UserSearch';
import { fetchUser, fetchAllRepos, fetchLanguages, fetchCommitActivity } from './api/github';
import { aggregateLanguages } from './analysis/languages';
import { bucketCommitsByDate, computeStreaks } from './analysis/heatmap';
import LanguageChart from './components/LanguageChart';

function App() {
  const [status, setStatus] = useState('idle'); // idle | loading | error | done
  const [profile, setProfile] = useState(null);
  const [langData, setLangData] = useState([]);
  const [streaks, setStreaks] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSearch(username) {
    if (!username.trim()) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const user = await fetchUser(username);
      setProfile(user);

      const repos = await fetchAllRepos(username);

      const reposWithLanguages = [];
      for (const repo of repos) {
        const languages = await fetchLanguages(username, repo.name);
        reposWithLanguages.push({ repo, languages });
      }
      setLangData(aggregateLanguages(reposWithLanguages));

            const commitActivities = [];
      for (const repo of repos) {
        try {
          const activity = await fetchCommitActivity(username, repo.name);
          console.log(`Activity for ${repo.name}:`, activity);
          if (Array.isArray(activity)) commitActivities.push(activity);
        } catch (err) {
          console.log(`Error fetching activity for ${repo.name}:`, err.message);
        }
      }
      console.log('Total commitActivities collected:', commitActivities.length);
      const dateMap = bucketCommitsByDate(commitActivities);
      console.log('dateMap:', dateMap);
      setStreaks(computeStreaks(dateMap));
      setStatus('done');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>GitHub Insights</h1>
      <UserSearch onSearch={handleSearch} />
            <div style={{ marginTop: 10, marginBottom: 10 }}>
        <input
          type="password"
          placeholder="Optional: GitHub token (for higher rate limit)"
          defaultValue={localStorage.getItem('gh_token') || ''}
          onChange={(e) => localStorage.setItem('gh_token', e.target.value)}
          style={{ width: 320 }}
        />
      </div>

      {status === 'loading' && <p>Loading...</p>}
      {status === 'error' && <p style={{ color: 'red' }}>Error: {errorMsg}</p>}

      {status === 'done' && profile && (
        <div style={{ marginTop: 20 }}>
          <h2>{profile.login}</h2>
          <p>Public repos: {profile.public_repos}</p>
          <p>Longest streak: {streaks.longest} days</p>
          <p>Current streak: {streaks.current} days</p>

          <h3>Top languages</h3>
          <LanguageChart langData={langData} />
          <ul>
            {langData.slice(0, 5).map((l) => (
              <li key={l.lang}>
                {l.lang}: {l.pct.toFixed(1)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;