import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, Result } from '@/lib/supabase';

// 强制动态渲染，避免构建时尝试静态生成
export const dynamic = 'force-dynamic';

/**
 * GET /api/stats
 * 获取统计数据
 */
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    // 获取所有结果数据
    const { data: results, error } = await supabase
      .from('results')
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    if (!results || results.length === 0) {
      return NextResponse.json({
        success: true,
        stats: null,
      });
    }

    // 计算统计数据
    const totalRecords = results.length;
    const uniqueEmployees = new Set(results.map((r) => r.employee_name)).size;
    const uniqueCities = new Set(results.map((r) => r.city_name)).size;
    const totalCompanyFee = results.reduce((sum, r) => sum + r.company_fee, 0);

    // 按城市分组统计
    const cityStats = new Map<string, { count: number; totalFee: number }>();
    for (const result of results) {
      const city = result.city_name;
      if (!cityStats.has(city)) {
        cityStats.set(city, { count: 0, totalFee: 0 });
      }
      const stats = cityStats.get(city)!;
      stats.count++;
      stats.totalFee += result.company_fee;
    }

    // 按员工分组统计
    const employeeStats = new Map<string, { cities: number; totalFee: number }>();
    for (const result of results) {
      const employee = result.employee_name;
      if (!employeeStats.has(employee)) {
        employeeStats.set(employee, { cities: 0, totalFee: 0 });
      }
      const stats = employeeStats.get(employee)!;
      stats.cities++;
      stats.totalFee += result.company_fee;
    }

    // 转换城市统计为数组并按金额降序排序
    const cityStatsArray = Array.from(cityStats.entries())
      .map(([city, data]) => ({
        city,
        count: data.count,
        totalFee: Number(data.totalFee.toFixed(2)),
      }))
      .sort((a, b) => b.totalFee - a.totalFee);

    // 转换员工统计为数组并按金额降序排序
    const employeeStatsArray = Array.from(employeeStats.entries())
      .map(([name, data]) => ({
        name,
        cities: data.cities,
        totalFee: Number(data.totalFee.toFixed(2)),
      }))
      .sort((a, b) => b.totalFee - a.totalFee);

    return NextResponse.json({
      success: true,
      stats: {
        totalRecords,
        uniqueEmployees,
        uniqueCities,
        totalCompanyFee: Number(totalCompanyFee.toFixed(2)),
        cityStats: cityStatsArray,
        employeeStats: employeeStatsArray,
      },
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '获取统计数据失败',
      },
      { status: 500 }
    );
  }
}
