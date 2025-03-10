import { useEffect, useState } from 'react';

export default function Recharge() {
  const [balance, setBalance] = useState(null);
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) {
      console.log('未找到用户名，请先登录');
      return;
    }

    // 发送请求获取余额
    fetch(`/api/getBalance?username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.balance !== undefined) {
          setBalance(data.balance);
        } else {
          console.error(data.message);
        }
      })
      .catch((error) => console.error('请求失败:', error));
  }, []);

  const handlePayment = async () => {
    const orderData = {
      // orderId: 'your-order-id',
      amount: '100.00',
      subject: 'ID photo generater 百元包',
      username: username,
    };
  
    try {
      const response = await fetch('/api/createalipay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.payHtml) {
          // 将支付宝支付表单插入到页面
          const payFormContainer = document.createElement('div');
          payFormContainer.innerHTML = data.payHtml; // 插入支付宝返回的支付表单 HTML
  
          // 将表单添加到页面并提交
          document.body.appendChild(payFormContainer);
          
          // 提交表单
          const form = payFormContainer.querySelector('form');
          // 确保 form 不为 null，再提交
          if (form) {
            form.submit();
          } else {
            console.error('未找到支付表单');
          }
        } else {
          console.error('支付请求失败，未收到支付表单');
        }
      } else {
        console.error('支付请求失败');
      }
    } catch (error) {
      console.error('支付请求失败:', error);
    }
  };

  return (
    <div className="flex flex-col xs:flex-row justify-between items-center w-full mt-3 border-b pb-7 sm:px-4 px-2 border-gray-500 gap-2">
      <h1 className="sm:text-3xl text-xl font-bold ml-2 tracking-tight">
        {username}
      </h1>

      <h1 className="sm:text-3xl text-xl font-bold ml-2 tracking-tight">
        余额：{balance}
      </h1>

      <button
        onClick={handlePayment}
        className="bg-green-600 px-4 py-2 rounded-xl hover:bg-green-500"
      >
        充值
      </button>
    </div>
  );
}