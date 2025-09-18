import { createClient } from '@supabase/supabase-js';

// 只在需要时调用此函数获取 Supabase 实例
export function getSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase 配置缺失");
  return createClient(url, anonKey);
}
