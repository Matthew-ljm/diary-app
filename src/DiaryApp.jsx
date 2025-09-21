import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DiaryApp = () => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [endReached, setEndReached] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [fullContentCache, setFullContentCache] = useState({});
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const listRef = useRef(null);
  const itemsPerPage = 5;

  // 加载日记
  useEffect(() => {
    const loadDiaries = () => {
      try {
        const savedDiaries = localStorage.getItem('diaries');
        if (savedDiaries) {
          setDiaries(JSON.parse(savedDiaries));
        }
      } catch (error) {
        console.error('Failed to load diaries:', error);
        setErrorMsg('加载日记失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    };

    loadDiaries();
  }, []);

  // 保存日记到localStorage
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('diaries', JSON.stringify(diaries));
      } catch (error) {
        console.error('Failed to save diaries:', error);
        setErrorMsg('保存日记失败，请稍后重试');
      }
    }
  }, [diaries, loading]);

  // 添加新日记
  const addDiary = (e) => {
    e.preventDefault();
    
    if (!name.trim() || !content.trim()) {
      setErrorMsg('标题和内容不能为空');
      return;
    }

    const newDiary = {
      uuid: uuidv4(),
      name,
      content,
      preview: content.length > 100 ? content.substring(0, 100) : content,
      hasMore: content.length > 100,
      created_at: new Date().toISOString()
    };

    setDiaries([newDiary, ...diaries]);
    setName('');
    setContent('');
    setSuccess(true);
    setErrorMsg('');
    
    // 3秒后隐藏成功提示
    setTimeout(() => setSuccess(false), 3000);
  };

  // 删除日记
  const deleteDiary = (uuid) => {
    if (window.confirm('确定要删除这篇日记吗？')) {
      setDiaries(diaries.filter(diary => diary.uuid !== uuid));
      if (expanded === uuid) {
        setExpanded(null);
      }
      // 从缓存中移除
      const newCache = { ...fullContentCache };
      delete newCache[uuid];
      setFullContentCache(newCache);
    }
  };

  // 展开日记查看全文
  const expandDiary = (uuid) => {
    setExpanded(uuid);
    // 缓存全文内容
    const diary = diaries.find(d => d.uuid === uuid);
    if (diary && !fullContentCache[uuid]) {
      setFullContentCache(prev => ({
        ...prev,
        [uuid]: diary.content
      }));
    }
  };

  // 收起日记
  const collapseDiary = () => {
    setExpanded(null);
  };

  // 加载更多日记
  const loadMoreDiaries = () => {
    if (loadingMore || endReached) return;
    
    setLoadingMore(true);
    
    // 模拟加载延迟
    setTimeout(() => {
      setLoadingMore(false);
      // 检查是否已加载全部
      if (diaries.length <= itemsPerPage) {
        setEndReached(true);
      }
    }, 800);
  };

  // 滚动监听，实现无限滚动
  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      // 当滚动到底部附近时加载更多
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMoreDiaries();
      }
    };

    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
  }, [loadingMore, endReached]);

  return (
    <div style={{ 
      maxWidth: 700, 
      margin: '30px auto', 
      padding: '0 15px', 
      display: 'flex', 
      gap: 32,
      fontFamily: 'Georgia, "Times New Roman", serif'
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ 
          color: '#5a4b3f', 
          borderBottom: '2px solid #e0d8c8', 
          paddingBottom: 10, 
          marginBottom: 20 
        }}>我的日记本</h1>
        
        {success && <div style={{ 
          color: '#2d6a4f', 
          backgroundColor: '#e9f7ef', 
          padding: '8px 12px', 
          borderRadius: 4, 
          marginBottom: 15,
          border: '1px solid #d1e7dd'
        }}>保存成功！</div>}
        
        {errorMsg && <div style={{ 
          color: '#721c24', 
          backgroundColor: '#f8d7da', 
          padding: '8px 12px', 
          borderRadius: 4, 
          marginBottom: 15,
          border: '1px solid #f5c6cb'
        }}>{errorMsg}</div>}
        
        <form onSubmit={addDiary} style={{ 
          marginBottom: 25, 
          padding: 15,
          backgroundColor: '#f9f7f3',
          borderRadius: 6,
          border: '1px solid #e8e1d3'
        }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="日记标题"
            required
            style={{ 
              width: '100%', 
              marginBottom: 12, 
              padding: 10,
              border: '1px solid #d9cfbe',
              borderRadius: 4,
              fontSize: 16,
              backgroundColor: '#fff'
            }}
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="写下今天的内容..."
            required
            rows={5}
            style={{ 
              width: '100%', 
              marginBottom: 12, 
              padding: 10,
              border: '1px solid #d9cfbe',
              borderRadius: 4,
              fontSize: 15,
              fontFamily: 'Georgia, serif',
              lineHeight: 1.6,
              resize: 'vertical',
              backgroundColor: '#fff'
            }}
          />
          <button type="submit" style={{ 
            padding: '8px 20px',
            backgroundColor: '#8b7d6b',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: pointer,
            fontSize: 14,
            transition: 'backgroundColor 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#7a6c5c'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#8b7d6b'}
          >
            添加日记
          </button>
        </form>
        
        <hr style={{ 
          border: 'none',
          borderTop: '1px dashed #c8beaf',
          margin: '20px 0'
        }} />
        
        <h2 style={{ 
          display: 'inline-block', 
          marginRight: 16,
          color: '#5a4b3f',
          fontSize: 18
        }}>日记列表</h2>
        
        <div
          ref={listRef}
          style={{
            maxHeight: 450,
            overflowY: 'auto',
            border: '1px solid #e0d8c8',
            borderRadius: 6,
            padding: 15,
            marginTop: 10,
            background: '#fcfbfa',
            boxShadow: '0 2px 3px rgba(0,0,0,0.05) inset'
          }}
        >
          {loading ? <div style={{ 
            textAlign: 'center', 
            padding: 20,
            color: '#8b7d6b'
          }}>加载中...</div> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {diaries.map(diary => (
                <li
                  key={diary.uuid}
                  style={{
                    border: '1px solid #e0d8c8',
                    borderRadius: 6,
                    marginBottom: 15,
                    padding: 15,
                    background: expanded === diary.uuid ? '#f8f5f0' : '#fff',
                    cursor: expanded ? 'default' : 'pointer',
                    transition: 'backgroundColor 0.2s'
                  }}
                  onClick={() => {
                    if (expanded !== diary.uuid) expandDiary(diary.uuid);
                  }}
                >
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: 17,
                    color: '#5a4b3f',
                    marginBottom: 5
                  }}>{diary.name}</div>
                  <div style={{ 
                    color: '#8b7d6b', 
                    fontSize: 13,
                    marginBottom: 8,
                    fontStyle: 'italic'
                  }}>
                    {new Date(diary.created_at + 'Z').toLocaleString('zh-CN', { 
                      hour12: false, 
                      timeZone: 'Asia/Shanghai' 
                    })}
                  </div>
                  {expanded === diary.uuid
                    ? (
                      <div style={{ 
                        marginTop: 6, 
                        marginBottom: 10, 
                        whiteSpace: 'pre-line',
                        lineHeight: 1.7,
                        color: '#3a3226'
                      }}>
                        {fullContentCache[diary.uuid] ?? '加载中...'}
                        <div>
                          <button onClick={collapseDiary} style={{ 
                            marginTop: 10,
                            padding: '5px 12px',
                            backgroundColor: '#f0e9df',
                            border: '1px solid #d9cfbe',
                            borderRadius: 3,
                            cursor: pointer,
                            fontSize: 13,
                            color: '#5a4b3f'
                          }}>
                            收起
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                        marginTop: 6, 
                        marginBottom: 6, 
                        color: '#3a3226',
                        lineHeight: 1.6
                      }}>
                        {diary.preview}
                        {diary.hasMore && '...'}
                        {diary.hasMore && (
                          <span style={{ 
                            color: '#8b7d6b', 
                            marginLeft: 8, 
                            fontSize: 13,
                            textDecoration: underline
                          }}>[点此查看全文]</span>
                        )}
                      </div>
                    )
                  }
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteDiary(diary.uuid);
                    }}
                    style={{ 
                      color: '#9b2c2c', 
                      border: 'none', 
                      background: 'none', 
                      cursor: 'pointer',
                      fontSize: 13,
                      padding: '3px 0',
                      textDecoration: underline
                    }}
                  >
                    删除
                  </button>
                </li>
              ))}
              {!loading && diaries.length === 0 && <li style={{
                textAlign: 'center',
                padding: 30,
                color: '#8b7d6b',
                fontStyle: 'italic'
              }}>暂无日记，开始记录你的第一篇吧~</li>}
            </ul>
          )}
          {(!loading && diaries.length > 0 && !endReached) &&
            <div style={{ 
              textAlign: 'center', 
              color: '#8b7d6b', 
              padding: 10,
              fontSize: 13
            }}>
              {loadingMore ? '加载中...' : '下拉可加载更多'}
            </div>
          }
          {endReached && <div style={{ 
            textAlign: 'center', 
            color: '#aaa', 
            padding: 10,
            fontSize: 13
          }}>已经到底啦~</div>}
        </div>
      </div>
    </div>
  );
};

export default DiaryApp;
