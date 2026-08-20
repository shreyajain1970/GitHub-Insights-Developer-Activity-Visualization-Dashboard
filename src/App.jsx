import { useEffect } from 'react';
import { fetchUser } from './api/github';

function App() {
  useEffect(() => {
    fetchUser('torvalds').then((data) => {
      console.log('User data:', data);
    });
  }, []);

  return (
    <div>
      <h1>GitHub Insights</h1>
    </div>
  );
}

export default App;