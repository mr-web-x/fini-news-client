import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        // Получаем cookies
        const cookieStore = await cookies();

        // Удаляем auth_token cookie
        cookieStore.delete('auth_token');

        return NextResponse.json({
            success: true,
            message: 'Успешный выход из системы'
        });

    } catch (error) {
        console.error('[Next.js API] Logout Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Ошибка при выходе из системы'
            },
            { status: 500 }
        );
    }
}

// Тестовый GET endpoint
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Logout API Route работает ✅',
        timestamp: new Date().toISOString()
    });
}