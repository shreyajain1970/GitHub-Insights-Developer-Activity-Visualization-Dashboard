import { useState } from 'react';

export default function UserSearch({ onSearch }) {
  const [value, setValue] = useState('');

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="GitHub username"
        onKeyDown={(e) => e.key === 'Enter' && onSearch(value)}
      />
      <button onClick={() => onSearch(value)}>Search</button>
    </div>
  );
}