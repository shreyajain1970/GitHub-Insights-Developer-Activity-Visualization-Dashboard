# GitHub Insights

A client-side dashboard that analyzes any GitHub user's activity — 
aggregating commit history, language usage, and repo metrics into derived 
visual insights, without needing a backend.

## What it does

- Search any GitHub username to see their profile, language breakdown, 
commit activity heatmap, and longest/current commit streaks
- Filter results by date range, repo type (original vs. forked), and 
language
- Sortable table of all repos by stars, last updated, and primary language
- Optional personal access token input to raise the GitHub API rate limit 
from 60/hour to 5,000/hour

## Why client-side only

This project intentionally has no backend or database. All fetching, 
caching, and analysis happens in the browser, using `localStorage` for 
response caching (20-minute TTL) instead of a server-side cache. This kept 
the scope focused on the actual analysis logic — commit-streak 
calculation, language aggregation — rather than infrastructure.

## Known limitations

- **Language filter doesn't affect the commit heatmap.** GitHub's 
`commit_activity` endpoint reports commits per day per repo, with no 
per-commit language data. True language-level heatmap filtering would 
require fetching and diffing individual commits — out of scope given the 
added API cost. The language filter does correctly narrow the language 
breakdown chart.
- **Streak totals reflect full history**, not the currently selected 
date-range filter, since streaks are meant to represent overall activity 
rather than a filtered window.
- Rate-limited to 60 requests/hour without a token; a personal access 
token (repo scope) raises this to 5,000/hour. Tokens are stored only in 
browser `localStorage` and never transmitted anywhere except directly to 
GitHub's API.

## Tech stack

- React (Vite)
- Chart.js / react-chartjs-2 for the language pie chart
- Custom CSS grid for the commit heatmap (no external heatmap library)
- GitHub REST API v3

## Setup

\`\`\`bash
git clone 
<https://github.com/shreyajain1970/GitHub-Insights-Developer-Activity-Visualization-Dashboard>
cd github-insights
npm install
npm run dev
\`\`\`

Open `http://localhost:5173`. Optionally paste a [GitHub personal access 
token](https://github.com/settings/tokens) (repo scope) into the token 
field to raise the rate limit.

## Architecture notes

- `src/api/` — raw GitHub API fetch functions + localStorage caching layer
- `src/analysis/` — pure functions for language aggregation, commit-date 
bucketing, and streak calculation, kept separate from fetching/UI so 
they're independently testable
- `src/components/` — presentational components

The streak-calculation logic was tested against synthetic edge-case data 
during development, which caught a bug where non-adjacent commit dates 
were initially being treated as part of one continuous streak.
