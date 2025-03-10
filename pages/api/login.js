import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '../../lib/mongodb';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {
      await connectDB(); // 确保数据库连接

      // 查找用户
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: '账号或密码错误' });
      }

      // 比对密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: '账号或密码错误' });
      }

      // 生成 JWT
      const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.status(200).json({ message: '登录成功', token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '服务器错误' });
    }
  }

  res.status(405).json({ message: 'Method Not Allowed' });
}
