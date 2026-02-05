import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase 客户端实例
let supabaseInstance: SupabaseClient<never> | null = null;

// 获取 Supabase 客户端（延迟初始化，只在运行时调用）
export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance as SupabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance as SupabaseClient;
};

// 兼容旧代码的导出（运行时调用）
export const supabase = new Proxy({} as never, {
  get(_, prop) {
    const client = getSupabaseClient();
    return (client as never)[prop];
  },
});

// 类型定义
export interface City {
  id?: number;
  city_name: string;
  year: string;
  rate: number;
  base_min: number;
  base_max: number;
}

export interface Salary {
  id?: number;
  employee_id: string;
  employee_name: string;
  month: string;
  salary_amount: number;
}

export interface Result {
  id?: number;
  employee_name: string;
  city_name: string;
  year: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
}
