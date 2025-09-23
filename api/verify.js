import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
    
    const { hashedPassword, salt } = req.body;
    
    if (!hashedPassword || !salt) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
    }
    
    try {
        const realPassword = process.env.VITE_PASSWORD;
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
        
        if (!realPassword || !supabaseUrl || !supabaseKey) {
            return res.status(500).json({ success: false, message: '服务器配置错误' });
        }
        
        // 使用相同的算法验证密码
        const hash = crypto.createHash('sha256');
        hash.update(realPassword + salt);
        const realHashedPassword = hash.digest('hex');
        
        if (hashedPassword === realHashedPassword) {
            // 密码正确，返回Supabase连接信息
            return res.status(200).json({ 
                success: true,
                supabaseUrl: supabaseUrl,
                supabaseKey: supabaseKey
            });
        } else {
            return res.status(200).json({ success: false });
        }
    } catch (error) {
        console.error('密码验证错误:', error);
        return res.status(500).json({ success: false, message: '服务器内部错误' });
    }
}