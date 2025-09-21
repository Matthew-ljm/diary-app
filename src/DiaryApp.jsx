import React, { useEffect, useState, useRef } from 'react';
import { getSupabaseClient } from './supabaseClient';

const PAGE_SIZE = 10;
const BLUR_LENGTH = 100;

function DiaryApp() {
  const supabase = getSupabaseClient();
  const [diaries, setDiaries] = useState([]); // {uuid, name, created_at, content?}
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [expanded, setExpanded] = useState(null); // 当前展开的uuid
  const [fullContentCache, setFullContentCache] = useState({}); // uuid: content
  const [endReached, setEndReached] = useState(false);

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const listRef = useRef(null);

  // 分页查日记列表（查 meta 和 content，内容预览前端截取）
  async function fetchDiaries(offset = 0, append = false) {
    if (offset === 0) setLoading(true);
    if (offset !== 0) setLoadingMore(true);
    setErrorMsg('');
    const { data, error } = await supabase
      .from('diary')
      .select('uuid,created_at,name,content')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      setErrorMsg(error.message);
    } else {
      // 预览只用 content 前100字
      let newData = data.map(d => ({
        ...d,
        preview: d.content ? d.content.slice(0, BLUR_LENGTH) : '',
        hasMore: d.content ? d.content.length > BLUR_LENGTH : false
      }));
      if (append) {
        setDiaries(prev => [...prev, ...newData]);
        if (newData.length < PAGE_SIZE) setEndReached(true);
      } else {
        setDiaries(newData);
        if (newData.length < PAGE_SIZE) setEndReached(true);
      }
    }
    setLoading(false);
    setLoadingMore(false);
  }

  useEffect(() => {
    setDiaries([]);
    setEndReached(false);
    fetchDiaries();
    // eslint-disable-next-line
  }, []);

  // 滚动到底懒加载下一页
  useEffect(() => {
    if (endReached) return;
    const handleScroll = () => {
      if (!listRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 40) {
        if (!loadingMore && diaries.length % PAGE_SIZE === 0 && !endReached) {
          fetchDiaries(diaries.length, true);
        }
      }
    };
    const ref = listRef.current;
    if (ref) ref.addEventListener('scroll', handleScroll);
    return () => {
      if (ref) ref.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line
  }, [diaries, loadingMore, endReached]);

  // 添加日记
  async function addDiary(e) {
    e.preventDefault();
    if (!name || !content) return;
    setErrorMsg('');
    const { error } = await supabase.from('diary').insert([{ name, content }]);
    if (!error) {
      setName('');
      setContent('');
      setSuccess(true);
      setDiaries([]);
      setEndReached(false);
      await fetchDiaries();
      setTimeout(() => setSuccess(false), 1600);
    } else {
      setErrorMsg(error.message);
    }
  }

  // 删除日记
  async function deleteDiary(uuid) {
    await supabase.from('diary').delete().eq('uuid', uuid);
    setDiaries([]);
    setEndReached(false);
    await fetchDiaries();
  }

  // 展开全文（只查一次，已缓存不重复查）
  async function expandDiary(uuid) {
    setExpanded(uuid);
    if (fullContentCache[uuid]) return;
    const { data, error } = await supabase
      .from('diary')
      .select('content')
      .eq('uuid', uuid)
      .maybeSingle();
    if (!error && data) {
      setFullContentCache(prev => ({ ...prev, [uuid]: data.content }));
    }
  }
  function collapseDiary() {
    setExpanded(null);
  }

  return (
    <div style={{ maxWidth: 700, margin: '30px auto', padding: 20, display: 'flex', gap: 32 }}>
      <div style={{ flex: 1 }}>
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
        <h2 style={{ display: 'inline-block', marginRight: 16 }}>日记列表</h2>
        <div
          ref={listRef}
          style={{
            maxHeight: 450,
            overflowY: 'auto',
            border: '1px solid #eee',
            borderRadius: 8,
            padding: 8,
            marginTop: 8,
            background: '#fafbfc'
          }}
        >
          {loading ? <div>加载中...</div> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {diaries.map(diary => (
                <li
                  key={diary.uuid}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: 8,
                    marginBottom: 12,
                    padding: 12,
                    background: expanded === diary.uuid ? '#f5faff' : '#fff',
                    cursor: expanded ? 'default' : 'pointer'
                  }}
                  onClick={() => {
                    if (expanded !== diary.uuid) expandDiary(diary.uuid);
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: 18 }}>{diary.name}</div>
                  <div style={{ color: '#888', fontSize: 14 }}>
                    {new Date(diary.created_at + 'Z').toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })}
                  </div>
                  {expanded === diary.uuid
                    ? (
                      <div style={{ marginTop: 6, marginBottom: 6, whiteSpace: 'pre-line' }}>
                        {fullContentCache[diary.uuid] ?? '加载中...'}
                        <div>
                          <button onClick={collapseDiary} style={{ marginTop: 8 }}>收起</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 6, marginBottom: 6, color: '#222' }}>
                        {diary.preview}
                        {diary.hasMore && '...'}
                        {diary.hasMore && (
                          <span style={{ color: '#2b70e4', marginLeft: 8, fontSize: 13 }}>[点此查看全文]</span>
                        )}
                      </div>
                    )
                  }
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteDiary(diary.uuid);
                    }}
                    style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    删除
                  </button>
                </li>
              ))}
              {!loading && diaries.length === 0 && <li>暂无日记</li>}
            </ul>
          )}
          {(!loading && diaries.length > 0 && !endReached) &&
            <div style={{ textAlign: 'center', color: '#888', padding: 8 }}>
              {loadingMore ? '加载中...' : '下拉可加载更多'}
            </div>
          }
          {endReached && <div style={{ textAlign: 'center', color: '#aaa', padding: 8 }}>已经到底啦~</div>}
        </div>
      </div>
    </div>
  );
}

export default DiaryApp;
