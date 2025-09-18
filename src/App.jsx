import React, { useState } from 'react';
import DiaryApp from './DiaryApp.jsx';

function App() {
  const [password, setPassword] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_PASSWORD) {
      setVerified(true);
      setError('');
    } else {
      setError('密码错误，请重试。');
    }
  };

  if (!verified) {
    return (
      <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
        <h2>请输入访问密码</h2>
        <form onSubmit={handleVerify}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="密码"
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
            autoFocus
          />
          <button type="submit" style={{ padding: '8px 20px' }}>验证</button>
        </form>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
    );
  }

  return <DiaryApp />;
}

export default App;
