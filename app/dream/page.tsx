"use client";

import { useState, useRef, useEffect } from 'react';
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Recharge from "../../components/Recharge";
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css'; // 导入裁剪样式

const FACEPLUSPLUS_API_KEY = "vD_p0dKvMFRjualwv4-1UX1XPE3450mD"; // 替换为你的 Face++ API Key
const FACEPLUSPLUS_API_SECRET = "BvrKksCz6YHqXvtpptBZ5t7q5BwDFKcu"; // 替换为你的 Face++ API Secret

export default function HomePage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState<string>('#02A7F0'); // 默认背景颜色
  const [croppedImage, setCroppedImage] = useState<string | null>(null); // 存储裁剪后的图片
  const [aspectRatio, setAspectRatio] = useState<number>(25 / 35); // 默认裁剪比例为一寸 (25/35)
  const [filledImage, setFilledImage] = useState<string | null>(null); // 用于存储背景已填充的图片

  // 使用 useRef 获取 Cropper 组件的引用
  const cropperRef = useRef<any>(null);
  // const username = localStorage.getItem('username');

  // const handlePayment = async () => {
  //   const orderData = {
  //     // orderId: 'your-order-id',
  //     amount: '100.00',
  //     subject: 'ID photo generater 百元包',
  //   };
  
  //   try {
  //     const response = await fetch('/api/createalipay', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(orderData),
  //     });
  
  //     if (response.ok) {
  //       const data = await response.json();
  //       if (data.payHtml) {
  //         // 将支付宝支付表单插入到页面
  //         const payFormContainer = document.createElement('div');
  //         payFormContainer.innerHTML = data.payHtml; // 插入支付宝返回的支付表单 HTML
  
  //         // 将表单添加到页面并提交
  //         document.body.appendChild(payFormContainer);
          
  //         // 提交表单
  //         const form = payFormContainer.querySelector('form');
  //         // 确保 form 不为 null，再提交
  //         if (form) {
  //           form.submit();
  //         } else {
  //           console.error('未找到支付表单');
  //         }
  //       } else {
  //         console.error('支付请求失败，未收到支付表单');
  //       }
  //     } else {
  //       console.error('支付请求失败');
  //     }
  //   } catch (error) {
  //     console.error('支付请求失败:', error);
  //   }
  // };

  // 上传图片并处理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imgSrc = reader.result as string;
        setOriginalImage(imgSrc);

        // 上传图片到 Face++ API
        setLoading(true);
        try {
          // 将图像数据编码为 Base64 格式
          const base64Image = imgSrc.split(',')[1]; // 获取 Base64 数据部分

          const formData = new FormData();
          formData.append("api_key", FACEPLUSPLUS_API_KEY);
          formData.append("api_secret", FACEPLUSPLUS_API_SECRET);
          formData.append("image_base64", base64Image); // 上传 Base64 图片数据

          // 请求 Face++ API
          const response = await fetch("https://api-cn.faceplusplus.com/humanbodypp/v2/segment", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (data.error_message) {
            console.error("Error:", data.error_message);
            setProcessedImage(null);
            setLoading(false);
            return;
          }

          // 获取返回的 body_image (分割后的人像图)
          const segmentedImageBase64 = data.body_image;

          if (segmentedImageBase64) {
            // 处理返回的图像，直接设置透明背景图
            setProcessedImage(`data:image/jpeg;base64,${segmentedImageBase64}`);
          } else {
            console.error("No segmented image returned.");
            setProcessedImage(null);
          }
        } catch (error) {
          console.error("Error analyzing image:", error);
          setProcessedImage(null);
        }
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理颜色选择器的变化
  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedBackgroundColor(e.target.value);
  };

  // 裁剪图片
  const handleCrop = () => {
    const cropperInstance = cropperRef.current?.cropper; // 通过 cropperRef 获取实例
    if (cropperInstance) {
      const croppedCanvas = cropperInstance.getCroppedCanvas({
        width: 500,
        height: 500, // 设置裁剪后的大小为 500x500
      });
      setCroppedImage(croppedCanvas.toDataURL()); // 设置裁剪后的图片
    }
  };

  // 填充背景色并更新图像
  const applyBackgroundColor = async () => {
    if (croppedImage) {
      const base64Image = croppedImage.split(',')[1]; // 获取 Base64 数据部分
      const updatedImage = await fillTransparentBackground(base64Image, selectedBackgroundColor);
      setFilledImage(updatedImage); // 更新裁剪后的图像
    }
  };

  // 将返回的图像 Base64 数据加载到 canvas 并填充透明区域
  const fillTransparentBackground = (segmentedImageBase64: string, backgroundColor: string) => {
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${segmentedImageBase64}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0); // 将图像绘制到 canvas 上

        // 获取图像的像素数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // 获取背景颜色的 RGB 值
        const bgColor = hexToRgb(backgroundColor);

        // 遍历每个像素点，填充透明区域
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3]; // 透明度值
          if (alpha === 0) {
            // 透明区域，填充背景色
            data[i] = bgColor.r; // 红色
            data[i + 1] = bgColor.g; // 绿色
            data[i + 2] = bgColor.b; // 蓝色
            data[i + 3] = 255; // 设置为完全不透明
          }
        }

        // 将修改后的图像数据放回 canvas
        ctx.putImageData(imageData, 0, 0);

        // 返回修改后的图像的 Base64 数据
        resolve(canvas.toDataURL());
      };
    });
  };

  // 辅助函数：将 hex 颜色转换为 RGB
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  // 更新裁剪框
  const updateCropper = (ratio: number) => {
    const cropperInstance = cropperRef.current?.cropper;
    if (cropperInstance) {
      cropperInstance.setAspectRatio(ratio); // 更新裁剪框比例

      // 获取当前裁剪框的尺寸
      const cropBoxData = cropperInstance.getCropBoxData();

      // 强制更新裁剪框的尺寸，以确保新的比例被应用
      cropperInstance.setCropBoxData({
        left: cropBoxData.left,
        top: cropBoxData.top,
        width: cropBoxData.width,
        height: cropBoxData.height,
      });
    }
  };

  const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ratio = parseFloat(e.target.value);
    // console.log("选择的比例", ratio);
    setAspectRatio(ratio); // 更新比例
  };

  // 使用 useEffect 监听 aspectRatio 变化
  useEffect(() => {
    if (aspectRatio) {
      // console.log("更新裁剪框的比例", aspectRatio);
      updateCropper(aspectRatio); // 每次比例变化时，更新裁剪框
    }
  }, [aspectRatio]); // 依赖 aspectRatio，确保比例变化时更新裁剪框`

  // 下载裁剪并填色后的图像
  const downloadImage = () => {
    if (filledImage) {
      const link = document.createElement('a');
      link.href = filledImage;
      link.download = 'cropped_image.png';
      link.click();
    }
  };

  // 预设颜色按钮的点击事件
  const setPresetColor = (color: string) => {
    setSelectedBackgroundColor(color);
  };

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <Recharge />

      {/* 充值按钮 */}
      {/* <button
        onClick={handlePayment} // 这里可以替换为你的支付页面链接
        className="bg-green-600 px-4 py-2 rounded-xl hover:bg-green-500"
      >
        充值
      </button> */}

      {/* <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
        <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">智能证件照生成APP开发</h2>
        <p className="mt-6 text-lg/8 text-pretty text-gray-300">请上传一张照片</p>
      </div> */}

      <div className="text-center py-4">
        <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">智能证件照生成APP开发</h2>
        <p className="mt-6 text-lg/8 text-pretty text-gray-300">请上传一张照片</p>
  
        {/* 上传图片 */}
        <label className="block">
          <input type="file" 
          className="file:border file:bg-gray-100 file:py-2 file:px-4 file:text-sm file:font-medium file:rounded-lg w-full max-w-xs cursor-pointer"
          onChange={handleImageUpload} />
        </label>

        {/* <input type="file" className="file-input file-input-bordered w-full max-w-xs" onChange={handleImageUpload} /> */}
        {/* <input type="file" accept="image/*" onChange={handleImageUpload} /> */}

        {loading && <p>加载中...</p>}
  
        {/* 显示原图和处理后的图像 */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {originalImage && !loading && (
            <div>
              <h2>原图:</h2>
              <img src={originalImage} alt="Uploaded" className="max-w-full h-auto mt-2" />
            </div>
          )}
  
          {processedImage && !loading && (
            <div>
              <h2>人体抠图:</h2>
              <img src={processedImage} alt="Processed" className="max-w-full h-auto mt-2" />
            </div>
          )}
        </div>
  
        {/* 裁剪比例选择 */}
        {processedImage && !loading && (
          <div className="mt-4">
            <label htmlFor="aspectRatio">选择尺寸:</label>
            <select
              id="aspectRatio"
              value={aspectRatio}
              onChange={handleAspectRatioChange}
              className="ml-2 p-2 border rounded text-black"
            >
              <option value={25 / 35}>1寸 (25 x 35 mm)</option>
              <option value={1 / 10}>自定义 (1 x 10 mm)</option>
            </select>
          </div>
        )}
  
        {/* 使用 Cropper 进行裁剪 */}
        {processedImage && !loading && (
          <div className="mt-4">
            <h2>裁剪图像:</h2>
            <Cropper
              src={processedImage}
              style={{ height: 400, width: '100%' }}
              aspectRatio={aspectRatio}
              guides={false}
              initialAspectRatio={aspectRatio}
              ref={cropperRef}
            />
          </div>
        )}
  
        {/* 裁剪按钮 */}
        {processedImage && !loading && (
          <div className="mt-4">
            <button
              onClick={handleCrop}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500"
            >
              裁剪
            </button>
          </div>
        )}
  
        {/* 填充背景颜色 */}
        {croppedImage && (
          <div className="mt-4">
            <label htmlFor="backgroundColor">选择背景颜色:</label>
            <input
              id="backgroundColor"
              type="color"
              value={selectedBackgroundColor}
              onChange={handleBackgroundColorChange}
              className="mr-4"
            />
            <button
              className="bg-[#02A7F0] w-8 h-8 rounded-full"
              onClick={() => setPresetColor("#02A7F0")}
            ></button>
            <button
              className="bg-[#D9001B] w-8 h-8 rounded-full ml-2"
              onClick={() => setPresetColor("#D9001B")}
            ></button>
            <button
              className="bg-[#FFFFFF] w-8 h-8 rounded-full ml-2"
              onClick={() => setPresetColor("#FFFFFF")}
            ></button>
            <button
              onClick={applyBackgroundColor}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl mt-2"
            >
              应用
            </button>
          </div>
        )}
  
        {/* 显示裁剪后的图像和填充背景后的图像 */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {croppedImage && (
            <div className="flex justify-center items-center">
              <div>
                <h2>裁剪图像:</h2>
                <img src={croppedImage} alt="Cropped" className="max-w-full h-auto mt-2" />
              </div>
            </div>
          )}

          {filledImage && (
            <div className="flex justify-center items-center">
              <div>
                <h2>最终结果:</h2>
                <img src={filledImage} alt="Image with Background" className="max-w-full h-auto mt-2" />
              </div>
            </div>
          )}
        </div>
  
        {/* 下载按钮 */}
        {filledImage && (
          <div className="mt-4">
            <button
              onClick={downloadImage}
              className="bg-green-600 text-white px-4 py-2 rounded-xl"
            >
              下载到本地
            </button>
          </div>
        )}
  
      </div>
      <Footer />
    </div>
  );
}
