'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Calculator, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const [citiesFile, setCitiesFile] = useState<File | null>(null);
  const [salariesFile, setSalariesFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpload = async () => {
    if (!citiesFile || !salariesFile) {
      setMessage({ type: 'error', text: '请同时选择 cities.xlsx 和 salaries.xlsx 文件' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('cities', citiesFile);
      formData.append('salaries', salariesFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '上传失败，请重试' });
    } finally {
      setUploading(false);
    }
  };

  const handleCalculate = async () => {
    setCalculating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '计算失败，请重试' });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <header className="pt-8 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center text-sky-600 hover:text-sky-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回首页
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-6">
            数据上传与操作
          </h1>
          <p className="text-gray-600 mt-2">
            上传数据文件并触发计算，生成五险一金缴纳结果
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-sky-100 rounded-xl">
                <Upload className="w-6 h-6 text-sky-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 ml-4">上传数据</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  城市标准数据 (cities.xlsx)
                </label>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => setCitiesFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                />
                {citiesFile && (
                  <p className="mt-2 text-sm text-green-600">已选择: {citiesFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  员工工资数据 (salaries.xlsx)
                </label>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => setSalariesFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                />
                {salariesFile && (
                  <p className="mt-2 text-sm text-green-600">已选择: {salariesFile.name}</p>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    上传数据
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Calculate Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Calculator className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 ml-4">执行计算</h2>
            </div>

            <p className="text-gray-600 mb-4">
              点击下方按钮执行计算，系统将根据已上传的数据计算每位员工在各城市的社保公积金缴纳金额。
            </p>

            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {calculating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  计算中...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5 mr-2" />
                  执行计算并存储结果
                </>
              )}
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`p-4 rounded-xl flex items-start ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              )}
              <p>{message.text}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
