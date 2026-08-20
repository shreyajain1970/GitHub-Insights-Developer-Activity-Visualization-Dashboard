import { getCached, setCached } from './cache';

const BASE = 'https://api.github.com';

function getToken() {
  return localStorage.getItem('gh_token') || null;
}

async function ghFetch(path) {
  const cacheKey = `gh:${path}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const token = getToken();
  const headers = token ? { Authorization: `token ${token}` } : {};
  const res = await fetch(`${BASE}${path}`, { headers });

  const remaining = res.headers.get('X-RateLimit-Remaining');
  if (remaining !== null) {
    window.dispatchEvent(new CustomEvent('rateLimitUpdate', { detail: Number(remaining) }));
  }

  if (res.status === 404) throw new Error('USER_NOT_FOUND');
  if (res.status === 403) throw new Error('RATE_LIMITED');
  if (!res.ok) throw new Error('UNKNOWN_ERROR');

  const data = await res.json();
  setCached(cacheKey, data);
  return data;
}

export async function fetchUser(username) {
  return ghFetch(`/users/${username}`);
}

export async function fetchAllRepos(username) {
  let page = 1;
  let all = [];
  while (true) {
    const repos = await ghFetch(`/users/${username}/repos?per_page=100&page=${page}`);
    all = all.concat(repos);
    if (repos.length < 100) break;
    page++;
  }
  return all;
}

export async function fetchLanguages(owner, repo) {
  return ghFetch(`/repos/${owner}/${repo}/languages`);
}

export async function fetchCommitActivity(owner, repo) {
  return ghFetch(`/repos/${owner}/${repo}/stats/commit_activity`);
}