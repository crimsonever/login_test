import { useEffect, useState } from 'react';

export default function Recharge() {
  const [balance, setBalance] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") { // 确保代码只在客户端执行
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
        fetch(`/api/getBalance?username=${storedUsername}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.balance !== undefined) {
              setBalance(data.balance);
            } else {
              console.error(data.message);
            }
          })
          .catch((error) => console.error("请求失败:", error));
      } else {
        console.log("未找到用户名，请先登录");
      }
    }
  }, []);

  const handlePayment = async () => {
    if (!username) {
      console.error("未找到用户名，无法进行支付");
      return;
    }

    const orderData = {
      amount: "100.00",
      subject: "ID photo generater 百元包",
      username,
    };

    try {
      const response = await fetch("/api/createalipay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.payHtml) {
          // 创建并插入支付表单
          const payFormContainer = document.createElement("div");
          payFormContainer.innerHTML = data.payHtml;
          document.body.appendChild(payFormContainer);

          // 提交支付表单
          const form = payFormContainer.querySelector("form");
          if (form) {
            form.submit();
          } else {
            console.error("未找到支付表单");
          }
        } else {
          console.error("支付请求失败，未收到支付表单");
        }
      } else {
        console.error("支付请求失败");
      }
    } catch (error) {
      console.error("支付请求失败:", error);
    }
  };

  return (
    <div className="flex flex-col xs:flex-row justify-between items-center w-full mt-3 border-b pb-7 sm:px-4 px-2 border-gray-500 gap-2">
      <h1 className="sm:text-3xl text-xl font-bold ml-2 tracking-tight">
        {username ?? "未登录"}
      </h1>

      <h1 className="sm:text-3xl text-xl font-bold ml-2 tracking-tight">
        余额：{balance ?? "获取中..."}
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
