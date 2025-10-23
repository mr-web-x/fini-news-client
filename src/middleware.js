import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Проверяем только приватные роуты /profil/*
    if (pathname.startsWith('/profil')) {
        // Получаем auth_token из cookies
        const authToken = request.cookies.get('auth_token');

        // Если токена нет - редирект на страницу входа
        if (!authToken) {
            const loginUrl = new URL('/prihlasenie', request.url);

            // Добавляем параметр next для возврата после авторизации
            loginUrl.searchParams.set('next', pathname);

            return NextResponse.redirect(loginUrl);
        }


        // через запрос к backend API, но пока достаточно проверки наличия
    }

    // Для всех остальных роутов - пропускаем
    return NextResponse.next();
}

export const config = {
    // Применяем middleware только к определенным путям
    matcher: [
        '/profil/:path*', // Все подпути /profil/*
    ]
};