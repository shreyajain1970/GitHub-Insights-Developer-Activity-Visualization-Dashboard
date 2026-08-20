import { useState, useMemo } from 'react';
import UserSearch from './components/UserSearch';
import { fetchUser, fetchAllRepos, fetchLanguages, fetchCommitActivity } from './api/github';
import { aggregateLanguages } from './analysis/languages';
import { bucketCommitsByDate, computeStreaks } from './analysis/heatmap';
import LanguageChart from './components/LanguageChart';
import CommitHeatmap from './components/CommitHeatmap';
import MoversTable from './components/MoversTable';
import { useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('idle'); // idle | loading | error | done
  const [profile, setProfile] = useState(null);
  const [langData, setLangData] = useState([]);
  const [streaks, setStreaks] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [dateMap, setDateMap] = useState({});
  const [repos, setRepos] = useState([]);
  const [reposWithLanguages, setReposWithLanguages] = useState([]);
  const [rawCommitActivities, setRawCommitActivities] = useState([]);
  const [rateLimitRemaining,setRateLimitRemaining] = useState(null);

  const [dateRangeDays, setDateRangeDays] = useState(365);
  const [repoTypeFilter, setRepoTypeFilter] = useState('all'); // 'all' | 'original' | 'forks'
  const [languageFilter, setLanguageFilter] = useState(null); // null = show all

  useEffect(() => {
    function handleRateLimitUpdate(e) {
      setRateLimitRemaining(e.detail);
    }
    window.addEventListener('rateLimitUpdate', handleRateLimitUpdate);
    return () => window.removeEventListener('rateLimitUpdate', handleRateLimitUpdate);
  }, []);

  async function handleSearch(username) {
    if (!username.trim()) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const user = await fetchUser(username);
      setProfile(user);

      const fetchedRepos = await fetchAllRepos(username);
      setRepos(fetchedRepos);

      const fetchedReposWithLanguages = [];
      for (const repo of fetchedRepos) {
        const languages = await fetchLanguages(username, repo.name);
        fetchedReposWithLanguages.push({ repo, languages });
      }
      setReposWithLanguages(fetchedReposWithLanguages);
      setLangData(aggregateLanguages(fetchedReposWithLanguages));

            const commitActivitiesWithRepo = [];
      for (const repo of fetchedRepos) {
        try {
          const activity = await fetchCommitActivity(username, repo.name);
          if (Array.isArray(activity)) {
            commitActivitiesWithRepo.push({ repoName: repo.name, activity });
          }
        } catch (err) {
          console.log(`Error fetching activity for ${repo.name}:`, err.message);
        }
      }
      setRawCommitActivities(commitActivitiesWithRepo);

      const computedDateMap = bucketCommitsByDate(commitActivitiesWithRepo.map((c) => c.activity));
      setDateMap(computedDateMap);
      setStreaks(computeStreaks(computedDateMap));

      // reset filters on a new search so old selections don't hide new data
      setRepoTypeFilter('all');
      setLanguageFilter(null);
      setDateRangeDays(365);

      setStatus('done');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }

  const filteredRepos = useMemo(() => {
    if (repoTypeFilter === 'original') return repos.filter((r) => !r.fork);
    if (repoTypeFilter === 'forks') return repos.filter((r) => r.fork);
    return repos;
  }, [repos, repoTypeFilter]);

  const filteredReposWithLanguages = useMemo(() => {
    const filteredNames = new Set(filteredRepos.map((r) => r.name));
    return reposWithLanguages.filter(({ repo }) => filteredNames.has(repo.name));
  }, [reposWithLanguages, filteredRepos]);

  const filteredLangData = useMemo(
    () => aggregateLanguages(filteredReposWithLanguages),
    [filteredReposWithLanguages]
  );

  const displayLangData = languageFilter
    ? filteredLangData.filter((l) => l.lang === languageFilter)
    : filteredLangData;

    const filteredDateMap = useMemo(() => {
    const filteredNames = new Set(filteredRepos.map((r) => r.name));
    const relevantActivities = rawCommitActivities
      .filter((c) => filteredNames.has(c.repoName))
      .map((c) => c.activity);

    const bucketed = bucketCommitsByDate(relevantActivities);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - dateRangeDays);
    const result = {};
    for (const [date, count] of Object.entries(bucketed)) {
      if (new Date(date) >= cutoff) result[date] = count;
    }
    return result;
  }, [rawCommitActivities, filteredRepos, dateRangeDays]);

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

      {rateLimitRemaining !== null && rateLimitRemaining < 10 && (
        <div style={{ background: '#fff3cd', color: '#856404', padding: 8, borderRadius: 4, marginBottom: 10 }}>
          ⚠️ GitHub API rate limit low: {rateLimitRemaining} requests remaining. Add a token above if you haven't, or wait for the limit to reset.
        </div>
      )}

      {status === 'loading' && <p>Loading...</p>}
      {status === 'error' && <p style={{ color: 'red' }}>Error: {errorMsg}</p>}

      {status === 'done' && (
        <div style={{ marginBottom: 15, display: 'flex', gap: 12, alignItems: 'center' }}>
          <label>
            Range:{' '}
            <select value={dateRangeDays} onChange={(e) => setDateRangeDays(Number(e.target.value))}>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 365 days</option>
            </select>
          </label>

          <label>
            Repo type:{' '}
            <select value={repoTypeFilter} onChange={(e) => setRepoTypeFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="original">Original only</option>
              <option value="forks">Forks only</option>
            </select>
          </label>

          <label>
            Language:{' '}
            <select value={languageFilter || ''} onChange={(e) => setLanguageFilter(e.target.value || null)}>
              <option value="">All</option>
              {filteredLangData.map((l) => (
                <option key={l.lang} value={l.lang}>{l.lang}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {status === 'done' && profile && (
        <div style={{ marginTop: 20 }}>
          <h2>{profile.login}</h2>
          <p>Public repos: {profile.public_repos}</p>
          <p>Longest streak: {streaks.longest} days</p>
          <p>Current streak: {streaks.current} days</p>

          <h3>Top languages</h3>
          <LanguageChart langData={displayLangData} />

          <h3>Commit activity</h3>
          <CommitHeatmap dateMap={filteredDateMap} />
          <h3>Repos</h3>
          <MoversTable repos={filteredRepos} reposWithLanguages={filteredReposWithLanguages}/>
          <ul>
            {displayLangData.slice(0, 5).map((l) => (
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