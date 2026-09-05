import { NextRequest, NextResponse } from 'next/server';
import { getTokenUsageStats } from '@/utils/token-tracker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const stats = await getTokenUsageStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve token usage statistics' },
      { status: 500 }
    );
  }
}
