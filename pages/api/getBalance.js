import connectDB from '../../lib/mongodb';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectDB(); // 连接数据库

    const { username } = req.query; // 获取请求参数中的用户名

    if (!username) {
      return res.status(400).json({ message: '用户名不能为空' });
    }

    // 查询用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    return res.status(200).json({ balance: user.balance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: '服务器错误' });
  }
}
