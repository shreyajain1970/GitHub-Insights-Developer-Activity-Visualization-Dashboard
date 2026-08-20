import { useState, useMemo } from 'react';

export default function MoversTable({ repos, reposWithLanguages }) {
  const [sortKey, setSortKey] = useState('stars');
  const [sortDir, setSortDir] = useState('desc');

  const primaryLangByRepo = useMemo(() => {
    const map = {};
    for (const { repo, languages } of reposWithLanguages) {
      const entries = Object.entries(languages);
      entries.sort((a, b) => b[1] - a[1]);
      map[repo.name] = entries.length > 0 ? entries[0][0] : '—';
    }
    return map;
  }, [reposWithLanguages]);

  const rows = useMemo(() => {
    return repos.map((r) => ({
      name: r.name,
      stars: r.stargazers_count,
      updated: r.updated_at,
      language: primaryLangByRepo[r.name] || r.language || '—',
      fork: r.fork,
    }));
  }, [repos, primaryLangByRepo]);

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === 'updated') {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }
      if (typeof av === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return sorted;
  }, [rows, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function arrow(key) {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: 10 }}>
      <thead>
        <tr>
          <th style={thStyle} onClick={() => handleSort('name')}>Repo{arrow('name')}</th>
          <th style={thStyle} onClick={() => handleSort('stars')}>Stars{arrow('stars')}</th>
          <th style={thStyle} onClick={() => handleSort('updated')}>Last updated{arrow('updated')}</th>
          <th style={thStyle} onClick={() => handleSort('language')}>Language{arrow('language')}</th>
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row) => (
          <tr key={row.name}>
            <td style={tdStyle}>{row.name}{row.fork ? ' (fork)' : ''}</td>
            <td style={tdStyle}>{row.stars}</td>
            <td style={tdStyle}>{new Date(row.updated).toLocaleDateString()}</td>
            <td style={tdStyle}>{row.language}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '6px 10px',
  borderBottom: '2px solid #ccc',
  cursor: 'pointer',
  userSelect: 'none',
};

const tdStyle = {
  padding: '6px 10px',
  borderBottom: '1px solid #eee',
};