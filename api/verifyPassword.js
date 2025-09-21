export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }
  const { password } = req.body;
  const realPassword = process.env.VITE_PASSWORD;
  if (password === realPassword) {
    res.status(200).json({ success: true });
  } else {
    res.status(200).json({ success: false });
  }
}