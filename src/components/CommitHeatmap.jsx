export default function CommitHeatmap({ dateMap }) {
  const dates = Object.keys(dateMap).sort();

  if (dates.length === 0) {
    return <p>No commit activity data available.</p>;
  }

  const maxCount = Math.max(...Object.values(dateMap), 1);

  function colorFor(count) {
    if (!count) return '#ebedf0';
    const intensity = Math.min(count / maxCount, 1);
    return `rgba(40, 167, 69, ${0.25 + intensity * 0.75})`;
  }

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(53, 10px)',
          gridAutoFlow: 'column',
          gridTemplateRows: 'repeat(7, 10px)',
          gap: 2,
        }}
      >
        {dates.map((d) => (
          <div
            key={d}
            title={`${d}: ${dateMap[d] || 0} commits`}
            style={{
              width: 10,
              height: 10,
              backgroundColor: colorFor(dateMap[d]),
              borderRadius: 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}