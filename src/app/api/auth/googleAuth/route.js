// app/api/auth/google/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // 1. Получаем Google credential из заголовка Authorization
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, message: 'Google токен не предоставлен' },
                { status: 401 }
            );
        }

        // Извлекаем токен
        const googleToken = authHeader.replace('Bearer ', '');

        // 2. Отправляем токен на backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10001';

        const response = await fetch(`${backendUrl}/api/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: googleToken }),
        });

        const data = await response.json();

        // 3. Если backend вернул ошибку
        if (!response.ok || !data.success) {
            return NextResponse.json(
                { success: false, message: data.message || 'Ошибка авторизации' },
                { status: response.status }
            );
        }

        // 4. Успешная авторизация - возвращаем данные и устанавливаем cookie
        const jwtToken = data.data.token;
        const user = data.data.user;

        // Создаём ответ с установкой cookie
        const nextResponse = NextResponse.json({
            success: true,
            message: 'Авторизация успешна',
            data: { user }
        });

        // Устанавливаем JWT токен в httpOnly cookie (безопасно!)
        nextResponse.cookies.set('auth_token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // только HTTPS в продакшене
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 дней
            path: '/',
        });

        return nextResponse;

    } catch (error) {
        console.error('[Next.js API] Google Auth Error:', error);
        return NextResponse.json(
            { success: false, message: 'Внутренняя ошибка сервера' },
            { status: 500 }
        );
    }
}

// Тестовый GET endpoint
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Google OAuth API Route работает ✅',
        timestamp: new Date().toISOString()
    });
}