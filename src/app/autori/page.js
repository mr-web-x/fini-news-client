// src/app/autori/page.js
import AuthorsListPage from "@/features/PublicPages/AuthorsListPage/AuthorsListPage";
import usersService from "@/services/users.service";

// ✅ ДОБАВЛЕНО: Отключаем кеширование для динамических параметров
export const dynamic = 'force-dynamic';

/**
 * ========================================
 * СТРАНИЦА АВТОРОВ - СЕРВЕРНЫЙ КОМПОНЕНТ
 * ========================================
 * 
 * Получаем параметры из URL и передаём в сервис
 * Backend сам обрабатывает поиск и пагинацию
 * 
 * Пример URL: /autori?search=jan&page=2
 */
export default async function AutoriPage({ searchParams }) {
    const params = await searchParams;

    // ✅ Берём параметры из URL как есть
    const search = params?.search || null;      // Поисковый запрос
    const page = parseInt(params?.page) || 1;   // Страница
    const limit = 12; // Количество авторов на странице

    let authors = [];
    let total = 0;
    let totalPages = 1;

    console.log('📄 Autori URL Params:', { search, page });

    // ✅ Загружаем авторов - передаём параметры как есть
    try {
        const filters = {
            page: page,           // Страница
            limit: limit,         // Лимит на странице
            search: search        // Поисковый запрос
        };

        console.log('🔍 Autori Filters to Backend:', filters);

        const authorsResponse = await usersService.getAllAuthors(filters);

        // ✅ ИСПРАВЛЕНО: Обрабатываем прямую структуру ответа
        if (authorsResponse && Array.isArray(authorsResponse.authors)) {
            authors = authorsResponse.authors || [];
            total = authorsResponse.total || 0;
            totalPages = authorsResponse.totalPages || 1;

            console.log('✅ Autori Loaded:', authors.length, 'authors | Total:', total);
        } else if (authorsResponse?.success && authorsResponse?.data) {
            // ✅ Резервный вариант: если всё-таки используется старая структура
            authors = authorsResponse.data.authors || [];
            total = authorsResponse.data.total || 0;
            totalPages = authorsResponse.data.totalPages || 1;
        } else {
            console.warn('⚠️ Autori Response structure unexpected:', authorsResponse);
            // Используем данные как есть, если они есть
            if (authorsResponse && typeof authorsResponse === 'object') {
                authors = authorsResponse.authors || [];
                total = authorsResponse.total || 0;
                totalPages = authorsResponse.totalPages || 1;
            }
        }

    } catch (error) {
        console.error('❌ Error loading authors:', error);
        // В случае ошибки оставляем пустой массив авторов
    }

    return (
        <AuthorsListPage
            authors={authors}
            currentPage={page}
            totalPages={totalPages}
            total={total}
        />
    );
}