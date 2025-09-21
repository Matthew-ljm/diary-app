import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }
  
  // 从请求体获取哈希密码和盐值（不再直接获取原始密码）
  const { hashedPassword, salt } = req.body;
  
  // 验证必要参数
  if (!hashedPassword || !salt) {
    res.status(400).json({ success: false, message: '缺少必要参数' });
    return;
  }
  
  try {
    // 获取真实密码
    const realPassword = process.env.VITE_PASSWORD;
    
    // 后端使用相同的算法和盐值对真实密码进行哈希处理
    const hash = crypto.createHash('sha256');
    hash.update(realPassword + salt); // 与前端保持一致的组合方式
    const realHashedPassword = hash.digest('hex');
    
    // 比较哈希值
    if (hashedPassword === realHashedPassword) {
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (error) {
    console.error('密码验证错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}
