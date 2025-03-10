"use client";

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SquigglyLines from "../components/SquigglyLines";
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);  // 保存用户名到 localStorage
      // console.log('data: ', data);
      // console.log('token: ', data.token);
      // console.log('username: ', username);
      router.push('/dream');
    } else {
      setError(data.message || '账号或密码错误');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('注册成功！现在可以登录');
      setIsLogin(true);
    } else {
      setError(data.message || '注册失败');
    }
  };

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header /> {/* 引入 Header */}
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 sm:mt-20 mt-20 background-gradient">
        <a
          href="https://vercel.fyi/roomGPT"
          target="_blank"
          rel="noreferrer"
          className="border border-gray-700 rounded-lg py-2 px-4 text-gray-400 text-sm mb-5 transition duration-300 ease-in-out"
        >
          Clone and deploy your own with{" "}
          <span className="text-blue-600">Vercel</span>
        </a>
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-normal text-gray-300 sm:text-7xl">
          智能证件照{" "}
          <span className="relative whitespace-nowrap text-blue-600">
            <SquigglyLines />
            <span className="relative">生成APP</span>
          </span>{" "}
          开发
        </h1>
        <h2 className="mx-auto mt-12 max-w-xl text-lg sm:text-gray-400 text-gray-500 leading-7">
          上传一张自己的图片，并选择需要的证件照参数———随后获得自己的智能证件照！
        </h2>

        {/* 登录/注册表单切换 */}
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="mt-8 w-full max-w-xs space-y-4">
          <div>
            <input
              type="text"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-800"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-800"
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          
          {/* 按钮区域 */}
          <div className="flex flex-col space-y-2">
            <button
              type="submit"
              className={`${
                isLogin ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'
              } rounded-xl text-white font-medium px-4 py-3 transition`}
            >
              {isLogin ? '登录' : '注册'}
            </button>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              type="button"
              className="text-blue-600 text-sm hover:underline"
            >
              {isLogin ? 'Don\'t have an account? Register' : 'Already have an account? Login'}
            </button>
          </div>
        </form>

        <div className="flex justify-between items-center w-full flex-col sm:mt-10 mt-6">
          <div className="flex flex-col space-y-10 mt-4 mb-16">
            <div className="flex sm:space-x-8 sm:flex-row flex-col">
              <div>
                <h3 className="mb-1 font-medium text-lg">Original</h3>
                <Image
                  alt="Original photo of a room with roomGPT.io"
                  src="/exa1.jpg"
                  className="w-full object-cover h-96 rounded-2xl"
                  width={400}
                  height={400}
                />
              </div>
              <div className="sm:mt-0 mt-8">
                <h3 className="mb-1 font-medium text-lg">Generated</h3>
                <Image
                  alt="Generated photo of a room with roomGPT.io"
                  width={400}
                  height={400}
                  src="/exa2.png"
                  className="w-full object-cover h-96 rounded-2xl sm:mt-0 mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
