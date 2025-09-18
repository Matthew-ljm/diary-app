[file name]: api/verify-password.js
[file content begin]
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { password } = req.body;
    const correctPassword = process.env.PASSWORD;
    
    if (password === correctPassword) {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false, error: '密码错误' });
    }
  } else {
    res.status(405).json({ error: '方法不允许' });
  }
}
[file content end]
