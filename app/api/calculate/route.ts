import { NextRequest, NextResponse } from 'next/server';
import { calculateAll } from '@/lib/calculate';

// 强制动态渲染，避免构建时尝试静态生成
export const dynamic = 'force-dynamic';

/**
 * POST /api/calculate
 * 执行五险一金计算并存储结果
 */
export async function POST(request: NextRequest) {
  try {
    const result = await calculateAll();

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('计算失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '计算失败',
      },
      { status: 500 }
    );
  }
}
