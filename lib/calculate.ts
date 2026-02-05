import { getSupabaseClient, Salary, City, Result } from './supabase';

/**
 * 计算最终缴费基数
 * 规则：低于下限用下限，高于上限用上限，在中间则用平均工资本身
 */
function calculateContributionBase(
  avgSalary: number,
  baseMin: number,
  baseMax: number
): number {
  if (avgSalary < baseMin) {
    return baseMin;
  } else if (avgSalary > baseMax) {
    return baseMax;
  }
  return avgSalary;
}

/**
 * 计算公司应缴纳金额
 */
function calculateCompanyFee(contributionBase: number, rate: number): number {
  return contributionBase * rate;
}

/**
 * 核心计算函数
 * 步骤：
 * 1. 从 salaries 表中读取所有数据
 * 2. 按员工姓名分组，计算年度月平均工资
 * 3. 遍历 cities 表中的所有城市
 * 4. 计算每位员工在各城市的缴费基数和公司应缴金额
 * 5. 将结果存入 results 表
 */
export async function calculateAll(): Promise<{ success: boolean; message: string; count?: number }> {
  const supabase = getSupabaseClient();

  try {
    // 1. 从 salaries 表中读取所有数据
    const { data: salaries, error: salariesError } = await supabase
      .from('salaries')
      .select('*');

    if (salariesError) {
      throw new Error(`读取工资数据失败: ${salariesError.message}`);
    }

    if (!salaries || salaries.length === 0) {
      return { success: false, message: '没有工资数据' };
    }

    // 2. 按员工姓名分组，计算年度月平均工资
    const salaryMap = new Map<string, number[]>();

    for (const salary of salaries) {
      const name = salary.employee_name;
      if (!salaryMap.has(name)) {
        salaryMap.set(name, []);
      }
      salaryMap.get(name)!.push(salary.salary_amount);
    }

    // 计算每位员工的平均工资
    const avgSalaryMap = new Map<string, number>();
    for (const [name, amounts] of salaryMap.entries()) {
      const sum = amounts.reduce((acc, curr) => acc + curr, 0);
      const avg = sum / amounts.length;
      avgSalaryMap.set(name, Number(avg.toFixed(2)));
    }

    // 3. 从 cities 表中读取所有城市数据
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*');

    if (citiesError) {
      throw new Error(`读取城市数据失败: ${citiesError.message}`);
    }

    if (!cities || cities.length === 0) {
      return { success: false, message: '没有城市数据' };
    }

    // 4. 清空 results 表（覆盖策略）
    const { error: deleteError } = await supabase
      .from('results')
      .delete()
      .neq('id', 0);

    if (deleteError) {
      throw new Error(`清空结果表失败: ${deleteError.message}`);
    }

    // 5. 计算每位员工在各城市的结果
    const results: Omit<Result, 'id'>[] = [];

    for (const [employeeName, avgSalary] of avgSalaryMap.entries()) {
      for (const city of cities) {
        const contributionBase = calculateContributionBase(
          avgSalary,
          city.base_min,
          city.base_max
        );
        const companyFee = calculateCompanyFee(contributionBase, city.rate);

        results.push({
          employee_name: employeeName,
          city_name: city.city_name,
          year: String(city.year),
          avg_salary: avgSalary,
          contribution_base: contributionBase,
          company_fee: Number(companyFee.toFixed(2)),
        });
      }
    }

    // 6. 批量插入 results 表
    const { error: insertError } = await supabase
      .from('results')
      .insert(results);

    if (insertError) {
      throw new Error(`插入结果数据失败: ${insertError.message}`);
    }

    return {
      success: true,
      message: `计算完成，共生成 ${results.length} 条结果`,
      count: results.length,
    };
  } catch (error) {
    console.error('计算失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '计算失败',
    };
  }
}
