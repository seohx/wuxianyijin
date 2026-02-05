import Link from 'next/link';
import Card from '@/components/Card';
import { Upload, FileSpreadsheet } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <header className="pt-12 pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          五险一金计算器
        </h1>
        <p className="text-gray-600 text-lg">
          轻松计算公司为员工应缴纳的社保公积金费用
        </p>
      </header>

      {/* Cards */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
          <Card
            title="数据上传"
            description="上传城市社保标准和员工工资数据，为计算做准备"
            href="/upload"
            icon={<Upload className="w-6 h-6 text-sky-600" />}
          />
          <Card
            title="结果查询"
            description="查看已生成的五险一金计算结果，支持筛选、排序和导出"
            href="/results"
            icon={<FileSpreadsheet className="w-6 h-6 text-sky-600" />}
          />
        </div>
      </div>
    </main>
  );
}
