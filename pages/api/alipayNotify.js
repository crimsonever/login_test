import { AlipaySdk } from "alipay-sdk";
import connectDB from "../../lib/mongodb";
import User from "../../models/User";
import qs from "qs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "alipayNotify.js Method Not Allowed" });
  }

  try {
    await connectDB(); // 连接数据库

    // 创建支付宝 SDK 实例
    const alipaySdk = new AlipaySdk({
      appId: '9021000144614060', // 沙箱中的 App ID
      gateway: 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',
      alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAo2RpAwNaYjPMRkfmXF8hAuDyvsc/YVcLBA1/jLHuTvax728nndV5tE6ASBii0nek4v9VQ8zho7QuOe4UM8Scg98T7/DltSU9jXdqUhvMR5pJr0HAXkIcuqsUIHYTAnvsvWB4lj897XH6S1IIz4KqnQrAsBhP7hOfKVLHg+fFwVKFOmfRUtKRTt5uPyDjPoa+zSHzFI23vihChm/7ZWwRUfFtGtW/d9Oz/3VnnLLNDa9ofdkMHex1xYOh+zTnUphXiVuJx9QP3NLHm9jGu9QRmJxQamoejarxcSeISGQqyxagHp1yoGuHxSWcLih5lN9aNHCwzH0DYQJ/jU6YkJ7L2wIDAQAB',
      privateKey: 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCSHoZOT5/JRMCFJ9gzHBvmULi6scs0DCkbusAExQOTcYotD1s4WsmylCTWDjNbcTrvlMKr3DfZsnFQmmzncm7LuAvgDvpuhNLCRP9RdzlBOlO1SHq1VMRU+xTpsCZVEM7MHN1HPSM1B6lIVnh0TzSoVW2pxOKVrTx7+7N4PlxEjNllce0qZZfeKFYkT+FQQ0zHdWUAugv41RlVWJMrMH572nc+73sjgX/YXMc3x2ojmfJNmp+gAmLWYiIZawgVjEsyXma1UxCHN5Nj5864oOwQ9e+Juh68iSwRPobpxBg88HKTAxPc3BgagiLHgCW01Y7BN3UiHIp3cdI/ASuOPvgbAgMBAAECggEBAIuDVZ0D7X6QhHkeuBDkr8bSH+8xvuEtEzsErj5flbB74gBv/xrppFc7l4hB+ss+a5VBJjZNh432ELdzGrRJ0Hv2eHAwHPDVJR6UHms8OJCNDkuyrmbgTq0NJsSRiagC6lB85tIUD7+cVwdYeJ4k2hQ3rQNBl05uH6gJhSwz7okLuOrgK0P4p+k8N+fQSMFTNvfR9B6qnE1H4kv5Mc6FxHZF0GvhbX3J9uueRfj+cr2Qeui2TDqertd50aSThx/xKfn/YnJTHdn3XTdUzig9WBtsWVERXJkoOc5CryWPCwRMdFDmgjzMhXbEs91r40kAVCYAuHxXrPClVQjb1GYOzHECgYEAyvsIYliAHz/QTbSKQa1ddXVoUlp8a9HTylXHw6tKmeOjG9oho9kU9TATmrumo0XGnqJgyTFLvcLzjSI/zaGXU4a9a86FzxoEZuswWalpwJR/pO6vIkWs7AvOQocu/+b40Z+HcbXsPGRV2lDCg+yjIynJ1jM4cJ1tXv3Uhn5Juy0CgYEAuElE+62PHZMLJ8ydqsH3V4RJZKI0L/tC/3eBC0wOf2uOWTfw6bZZ1X6XkfcENqUgERnSQP7CY354Y04w7sCbjS5aIKwcoaeAiFsnYpy7CvM+KnngkgjrYA+qGA1lRGAuVUiiBSkxMWQ5+C/I5We6pJR4iLa+Sx/LhvTxxqz87WcCgYEAo8H9VKKD0zI/ksFKHYyJbv7myDIaWT4yePXVsYXbLOZbLFhCdZbocptz5Yzo9qaPhGIKZabwrUrABSgRg4uPs6Jr5bL7f0dFL+ck3eFw4R6tEFpETwkZZmJr6H55q5kjOrNSqamUynBEV1p6Y8ahIvhOzxIJwckweMeeE1eFko0CgYBHLE0PIp3WXzb8vQLbsyPy0e2Chz6+lTzv61iUY2BqB8EnZfqOWNXjJYwmXI9tB2MWF7HjVkD/KhYWzFkLrKmm4hL+8VnxeP6kKwhQBpYaiY0l3IJGBFnbdNFNjsbgnIDogS/J7HnKSJo250Wgi+pCq/DNZD6kRvhU+/7wq1jX2wKBgHiOhefHybvZ4AMXdNUhTs4f1SCphMGVbp2oqIq/UhTOyR7XfTeW+1RvQd/vrlhAQEmO1ADD9+b9ymsEOKSIwid+C2UKcidDaZDB4am896eUnff3xTVTrY+341H6sszRD21Fd/eoSRvHSXQ0Sd+uTQIiQv4lnrCIwjgxALowxq05', // 商户私钥
    });

    // 获取支付宝回调的参数
    const rawData = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => resolve(qs.parse(data))); // 解析支付宝发送的 x-www-form-urlencoded 数据
      req.on("error", (err) => reject(err));
    });

    console.log("支付宝回调数据:", rawData);

    // 验证支付宝签名，确保请求合法
    const isVerified = alipaySdk.checkNotifySign(rawData);
    if (!isVerified) {
      console.error("支付宝签名验证失败");
      return res.status(400).json({ error: "Invalid Signature" });
    }

    const { out_trade_no, total_amount, trade_status, buyer_id } = rawData;

    if (trade_status === "TRADE_SUCCESS") {
      console.log(`订单 ${out_trade_no} 支付成功，金额：${total_amount}`);

      const username = localStorage.getItem('username');

      // 更新用户余额
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: "用户未找到" });
      }

      user.balance += parseFloat(total_amount); // 增加余额
      await user.save();

      console.log(`用户 ${username} 余额更新成功，新余额：${user.balance}`);

      return res.status(200).json({ message: "余额已更新" });
    }

    return res.status(400).json({ error: "交易未成功" });
  } catch (error) {
    console.error("支付宝异步通知处理失败:", error);
    return res.status(500).json({ error: "服务器错误" });
  }
}
