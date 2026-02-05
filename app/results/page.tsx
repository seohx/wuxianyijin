'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Users,
  DollarSign,
  Building2,
} from 'lucide-react';
import * as xlsx from 'xlsx';

interface Result {
  id?: number;
  employee_name: string;
  city_name: string;
  year: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
}

interface ResultsResponse {
  success: boolean;
  data?: Result[];
  message?: string;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface StatsData {
  totalRecords: number;
  uniqueEmployees: number;
  uniqueCities: number;
  totalCompanyFee: number;
  cityStats: Array<{ city: string; count: number; totalFee: number }>;
  employeeStats: Array<{ name: string; cities: number; totalFee: number }>;
}

interface StatsResponse {
  success: boolean;
  stats?: StatsData;
  message?: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [employeeNameFilter, setEmployeeNameFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState('employee_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pageSize = 10;

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data: StatsResponse = await response.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const params = new URLSearchParams({
        employeeName: employeeNameFilter,
        city: cityFilter,
        sortBy: sortBy,
        sortOrder: sortOrder,
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(`/api/results?${params.toString()}`);
      const data: ResultsResponse = await response.json();

      if (data.success && data.data) {
        setResults(data.data);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else {
        setMessage({ type: 'error', text: data.message || '获取结果失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '获取结果失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    fetchStats();
  }, [employeeNameFilter, cityFilter, sortBy, sortOrder, page]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleExport = () => {
    try {
      // 获取所有数据用于导出
      const exportData = results.map((item) => ({
        员工姓名: item.employee_name,
        城市: item.city_name,
        年份: item.year,
        年度月平均工资: item.avg_salary,
        最终缴费基数: item.contribution_base,
        公司缴纳金额: item.company_fee,
      }));

      const ws = xlsx.utils.json_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, '五险一金计算结果');
      xlsx.writeFile(wb, '五险一金计算结果.xlsx');

      setMessage({ type: 'success', text: '导出成功！' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: '导出失败，请重试' });
    }
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <header className="pt-8 pb-6">
        <div className="max-w-6xl mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center text-sky-600 hover:text-sky-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回首页
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-6">
            结果查询
          </h1>
          <p className="text-gray-600 mt-2">
            查看五险一金计算结果，支持筛选、排序、分页和导出
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Statistics Cards */}
          {stats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow-md p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">总记录数</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalRecords}</p>
                    </div>
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-sky-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">员工人数</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{stats.uniqueEmployees}</p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">城市数量</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{stats.uniqueCities}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">总缴纳金额</p>
                      <p className="text-2xl font-bold text-sky-600 mt-1">
                        {stats.totalCompanyFee.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <DollarSign className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* City Statistics */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-purple-600" />
                  按城市统计
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          城市
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          员工数
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          缴纳金额
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          占比
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.cityStats.map((cityStat, index) => (
                        <tr
                          key={cityStat.city}
                          className={`border-t border-gray-100 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">{cityStat.city}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {cityStat.count}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            {cityStat.totalFee.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {((cityStat.totalFee / stats.totalCompanyFee) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Employee Statistics */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-emerald-600" />
                  按员工统计
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          员工姓名
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          城市数
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          缴纳金额
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          占比
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.employeeStats.map((empStat, index) => (
                        <tr
                          key={empStat.name}
                          className={`border-t border-gray-100 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">{empStat.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {empStat.cities}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium text-sky-600">
                            {empStat.totalFee.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {((empStat.totalFee / stats.totalCompanyFee) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  按员工姓名筛选
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={employeeNameFilter}
                    onChange={(e) => {
                      setEmployeeNameFilter(e.target.value);
                      setPage(1);
                    }}
                    placeholder="输入员工姓名..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  按城市筛选
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={cityFilter}
                    onChange={(e) => {
                      setCityFilter(e.target.value);
                      setPage(1);
                    }}
                    placeholder="输入城市名称..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchResults}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-xl transition-colors flex items-center"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </button>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleExport}
                  disabled={results.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-xl transition-colors flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  导出 Excel
                </button>
              </div>
            </div>
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

          {/* Results Table */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      onClick={() => handleSort('employee_name')}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      员工姓名 {renderSortIcon('employee_name')}
                    </th>
                    <th
                      onClick={() => handleSort('city_name')}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      城市 {renderSortIcon('city_name')}
                    </th>
                    <th
                      onClick={() => handleSort('year')}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      年份 {renderSortIcon('year')}
                    </th>
                    <th
                      onClick={() => handleSort('avg_salary')}
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      年度月平均工资 {renderSortIcon('avg_salary')}
                    </th>
                    <th
                      onClick={() => handleSort('contribution_base')}
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      最终缴费基数 {renderSortIcon('contribution_base')}
                    </th>
                    <th
                      onClick={() => handleSort('company_fee')}
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      公司缴纳金额 {renderSortIcon('company_fee')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        加载中...
                      </td>
                    </tr>
                  ) : results.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        暂无数据，请先上传数据并执行计算
                      </td>
                    </tr>
                  ) : (
                    results.map((result, index) => (
                      <tr
                        key={result.id || index}
                        className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">{result.employee_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{result.city_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{result.year}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {result.avg_salary.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {result.contribution_base.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium text-sky-600">
                          {result.company_fee.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  共 {total} 条记录，第 {page} / {totalPages} 页
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
