import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [diaries, setDiaries] = useState([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // 检查本地存储的认证状态
  useEffect(() => {
    const isAuth = localStorage.getItem('diary_auth') === 'true';
    setIsAuthenticated(isAuth);
    if (isAuth) {
      fetchDiaries();
    }
  }, []);

  // 验证密码
  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    
    try {
      // 直接在前端比较密码（生产环境应该使用后端API）
      const correctPassword = import.meta.env.VITE_APP_PASSWORD;
      if (password === correctPassword) {
        setIsAuthenticated(true);
        localStorage.setItem('diary_auth', 'true');
        fetchDiaries();
      } else {
        setAuthError('密码错误');
      }
    } catch (error) {
      setAuthError('验证失败');
    }
  }

  // 获取日记列表
  async function fetchDiaries() {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('diary')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setDiaries(data);
    } catch (error) {
      console.error('获取日记失败:', error);
    }
    setLoading(false);
  }

  // 添加日记
  async function addDiary(e) {
    e.preventDefault();
    if (!name || !content || !isAuthenticated) return;
    try {
      const { error } = await supabase.from('diary').insert([
        { name, content }
      ]);
      if (!error) {
        setName('');
        setContent('');
        fetchDiaries();
      }
    } catch (error) {
      console.error('添加日记失败:', error);
    }
  }

  // 删除日记
  async function deleteDiary(uuid) {
    if (!isAuthenticated) return;
    try {
      await supabase.from('diary').delete().eq('uuid', uuid);
      fetchDiaries();
    } catch (error) {
      console.error('删除日记失败:', error);
    }
  }

  // 退出登录
  function handleLogout() {
    setIsAuthenticated(false);
    localStorage.removeItem('diary_auth');
    setDiaries([]);
    setPassword('');
  }

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
        <h1>我的日记本</h1>
        <form onSubmit={handleLogin} style={{ marginBottom: 20 }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="请输入密码"
            required
            style={{ width: '100%', marginBottom: 10, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
          />
          {authError && <div style={{ color: 'red', marginBottom: 10, fontSize: 14 }}>{authError}</div>}
          <button 
            type="submit" 
            style={{ 
              padding: '10px 20px', 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer',
              width: '100%'
            }}
          >
            登录
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '30px auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>我的日记本</h1>
        <button 
          onClick={handleLogout} 
          style={{ 
            padding: '8px 16px', 
            background: '#ff4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          退出
        </button>
      </div>
      
      <form onSubmit={addDiary} style={{ marginBottom: 20 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="日记标题"
          required
          style={{ width: '100%', marginBottom: 10, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="写下今天的内容..."
          required
          rows={5}
          style={{ width: '100%', marginBottom: 10, padding: 8, border: '1px solid #ccc', borderRadius: 4, resize: 'vertical' }}
        />
        <button 
          type="submit" 
          style={{ 
            padding: '10px 20px', 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          添加日记
        </button>
      </form>
      
      <hr style={{ margin: '20px 0' }} />
      
      <h2>日记列表</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>加载中...</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {diaries.map(diary => (
            <li key={diary.uuid} style={{ 
              border: '1px solid #ddd', 
              borderRadius: 8, 
              marginBottom: 16, 
              padding: 16,
              background: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>{diary.name}</div>
              <div style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>
                {new Date(diary.created_at).toLocaleString('zh-CN')}
              </div>
              <div style={{ 
                marginBottom: 12, 
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {diary.content}
              </div>
              <button 
                onClick={() => {
                  if (window.confirm('确定要删除这篇日记吗？')) {
                    deleteDiary(diary.uuid);
                  }
                }}
                style={{ 
                  color: '#ff4444', 
                  border: '1px solid #ff4444', 
                  background: 'none', 
                  cursor: 'pointer',
                  padding: '4px 12px',
                  borderRadius: 4,
                  fontSize: 14
                }}
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      )}
      
      {diaries.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>
          还没有日记，开始写第一篇吧！
        </div>
      )}
    </div>
  );
}

export default App;
