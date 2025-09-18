import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from './supabaseClient';

function DiaryApp() {
  const supabase = getSupabaseClient();
  const [diaries, setDiaries] = useState([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 获取日记列表
  async function fetchDiaries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('diary')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) {
      setDiaries(data || []);
    } else {
      setErrorMsg(error.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchDiaries();
    // eslint-disable-next-line
  }, []);

  // 添加日记
  async function addDiary(e) {
    e.preventDefault();
    if (!name || !content) return;
    setErrorMsg('');
    // 插入时不传created_at，数据库自动加东八区时间（见后端表结构设置）
    const { error } = await supabase.from('diary').insert([
      { name, content }
    ]);
    if (!error) {
      setName('');
      setContent('');
      setSuccess(true);
      fetchDiaries();
      setTimeout(() => setSuccess(false), 1600);
    } else {
      setErrorMsg(error.message);
    }
  }

  // 删除日记
  async function deleteDiary(uuid) {
    await supabase.from('diary').delete().eq('uuid', uuid);
    fetchDiaries();
  }

  return (
    <div style={{ maxWidth: 600, margin: '30px auto', padding: 20 }}>
      <h1>我的日记本</h1>
      {success && <div style={{ color: 'green', marginBottom: 10 }}>保存成功！</div>}
      {errorMsg && <div style={{ color: 'red', marginBottom: 10 }}>{errorMsg}</div>}
      <form onSubmit={addDiary} style={{ marginBottom: 20 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="日记标题"
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="写下今天的内容..."
          required
          rows={5}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <button type="submit" style={{ padding: '8px 20px' }}>添加日记</button>
      </form>
      <hr />
      <h2>日记列表</h2>
      {loading ? <div>加载中...</div> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {diaries.map(diary => (
            <li key={diary.uuid} style={{ border: '1px solid #ccc', borderRadius: 8, marginBottom: 12, padding: 12 }}>
              <div style={{ fontWeight: 'bold', fontSize: 18 }}>{diary.name}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{new Date(diary.created_at + 'Z').toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })}</div>
              <div style={{ marginTop: 6, marginBottom: 6, whiteSpace: 'pre-line' }}>{diary.content}</div>
              <button onClick={() => deleteDiary(diary.uuid)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
                删除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DiaryApp;
