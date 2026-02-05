import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, Result } from '@/lib/supabase';

// 强制动态渲染，避免构建时尝试静态生成
export const dynamic = 'force-dynamic';

/**
 * GET /api/results
 * 获取计算结果数据，支持筛选和排序
 */
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeName = searchParams.get('employeeName') || '';
    const city = searchParams.get('city') || '';
    const sortBy = searchParams.get('sortBy') || 'employee_name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // 构建查询
    let query = supabase.from('results').select('*', { count: 'exact' });

    // 应用筛选
    if (employeeName) {
      query = query.ilike('employee_name', `%${employeeName}%`);
    }
    if (city) {
      query = query.ilike('city_name', `%${city}%`);
    }

    // 获取总数
    const { count } = await query;

    // 应用排序
    query = query.order(sortBy as keyof Result, {
      ascending: sortOrder === 'asc',
    });

    // 应用分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error('获取结果失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '获取结果失败',
      },
      { status: 500 }
    );
  }
}
