import React, { useState, useEffect } from 'react';
import DiaryApp from './DiaryApp.jsx';
import axios from 'axios';

function trackPageVisit() {
  const currentPageUrl = window.location.href;
  const trackerUrl = 'https://mail.m-code.top/';
  const fullTrackerUrl = `${trackerUrl}?url=${encodeURIComponent(currentPageUrl)}&event=password_lock`;
  var iframe = document.createElement('iframe');
  iframe.src = fullTrackerUrl;
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
}

function setupTracking() {
  if (document.readyState === 'complete') {
    setTimeout(trackPageVisit, 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(trackPageVisit, 1000);
    });
  }
}

function App() {
  const [password, setPassword] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [lockEndTime, setLockEndTime] = useState(0);

  useEffect(() => {
    const savedCount = localStorage.getItem('passwordErrorCount');
    const savedLockTime = localStorage.getItem('passwordLockEndTime');
    
    if (savedCount) setErrorCount(Number(savedCount));
    if (savedLockTime) setLockEndTime(Number(savedLockTime));
  }, []);

  useEffect(() => {
    localStorage.setItem('passwordErrorCount', errorCount);
    localStorage.setItem('passwordLockEndTime', lockEndTime);
  }, [errorCount, lockEndTime]);

  const isLocked = () => {
    const now = Date.now();
    return now < lockEndTime;
  };

  const getRemainingLockTime = () => {
    const now = Date.now();
    const remaining = Math.ceil((lockEndTime - now) / (1000 * 60));
    return remaining > 0 ? remaining : 0;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const now = Date.now();

    if (isLocked()) {
      setError(`账户已锁定，请${getRemainingLockTime()}分钟后重试`);
      return;
    }

    try {
      const response = await axios.post(
        'https://diary.m-code.top/api/verifyPassword',
        { password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = response.data;
      if (data.success) {
        setVerified(true);
        setError('');
        setErrorCount(0);
      } else {
        const newCount = errorCount + 1;
        setErrorCount(newCount);
        
        if (newCount >= 3) {
          const oneHourLater = now + 60 * 60 * 1000;
          setLockEndTime(oneHourLater);
          setError('密码错误3次，账户已锁定1小时');
          setupTracking();
        } else {
          setError(`密码错误，还剩${3 - newCount}次机会`);
        }
      }
    } catch (err) {
      if (err.response) {
        setError(`接口错误：${err.response.statusText}`);
      } else if (err.request) {
        setError('网络错误，请检查连接');
      } else {
        setError('请求发送失败，请稍后重试');
      }
      console.error('验证请求失败：', err);
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
            disabled={isLocked()}
          />
          <button 
            type="submit" 
            style={{ padding: '8px 20px' }}
            disabled={isLocked()}
          >
            {isLocked() ? `锁定中（${getRemainingLockTime()}分钟后解锁）` : '验证'}
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </div>
    );
  }

  return <DiaryApp />;
}

export default App;
