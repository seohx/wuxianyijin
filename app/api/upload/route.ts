import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, City, Salary } from '@/lib/supabase';
import * as xlsx from 'xlsx';

// 强制动态渲染，避免构建时尝试静态生成
export const dynamic = 'force-dynamic';

/**
 * POST /api/upload
 * 上传 Excel 文件并解析数据到 Supabase
 */
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const formData = await request.formData();
    const citiesFile = formData.get('cities') as File;
    const salariesFile = formData.get('salaries') as File;

    if (!citiesFile || !salariesFile) {
      return NextResponse.json(
        { success: false, message: '请同时上传 cities.xlsx 和 salaries.xlsx 文件' },
        { status: 400 }
      );
    }

    // 解析 cities.xlsx
    const citiesBuffer = await citiesFile.arrayBuffer();
    const citiesWorkbook = xlsx.read(citiesBuffer, { type: 'array' });
    const citiesSheet = citiesWorkbook.Sheets[citiesWorkbook.SheetNames[0]];
    const citiesData = xlsx.utils.sheet_to_json<Record<string, any>>(citiesSheet);

    // 处理 cities 数据（注意列名 city_namte 需映射为 city_name）
    const cities: Omit<City, 'id'>[] = citiesData.map((row) => ({
      city_name: row['city_namte '], // 注意原列名有尾随空格
      year: String(row['year']),
      rate: row['rate'],
      base_min: row['base_min'],
      base_max: row['base_max'],
    }));

    // 解析 salaries.xlsx
    const salariesBuffer = await salariesFile.arrayBuffer();
    const salariesWorkbook = xlsx.read(salariesBuffer, { type: 'array' });
    const salariesSheet = salariesWorkbook.Sheets[salariesWorkbook.SheetNames[0]];
    const salariesData = xlsx.utils.sheet_to_json<Record<string, any>>(salariesSheet);

    const salaries: Omit<Salary, 'id'>[] = salariesData.map((row) => ({
      employee_id: String(row['employee_id']),
      employee_name: row['employee_name'],
      month: String(row['month']),
      salary_amount: row['salary_amount'],
    }));

    // 清空旧数据并插入新数据（覆盖策略）
    const { error: deleteCitiesError } = await supabase
      .from('cities')
      .delete()
      .neq('id', 0);

    if (deleteCitiesError) {
      throw new Error(`清空城市表失败: ${deleteCitiesError.message}`);
    }

    const { error: deleteSalariesError } = await supabase
      .from('salaries')
      .delete()
      .neq('id', 0);

    if (deleteSalariesError) {
      throw new Error(`清空工资表失败: ${deleteSalariesError.message}`);
    }

    // 插入 cities 数据
    const { error: insertCitiesError } = await supabase
      .from('cities')
      .insert(cities);

    if (insertCitiesError) {
      throw new Error(`插入城市数据失败: ${insertCitiesError.message}`);
    }

    // 插入 salaries 数据
    const { error: insertSalariesError } = await supabase
      .from('salaries')
      .insert(salaries);

    if (insertSalariesError) {
      throw new Error(`插入工资数据失败: ${insertSalariesError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `上传成功！共导入 ${cities.length} 条城市数据，${salaries.length} 条工资数据`,
      citiesCount: cities.length,
      salariesCount: salaries.length,
    });
  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '上传失败',
      },
      { status: 500 }
    );
  }
}
