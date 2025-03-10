import bcrypt from 'bcryptjs';
import connectDB from '../../lib/mongodb';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {
      await connectDB(); // 确保数据库连接

      // 检查用户名是否已存在
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const user = new User({
        username,
        password: hashedPassword,
      });

      await user.save();

      return res.status(200).json({ message: '注册成功' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '服务器错误' });
    }
  }

  res.status(405).json({ message: 'Method Not Allowed' });
}
