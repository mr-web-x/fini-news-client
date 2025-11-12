// src/app/autori/[slug]/page.js
import AuthorDetailPage from "@/features/PublicPages/AuthorDetailPage/AuthorDetailPage";
import usersService from "@/services/users.service";
import articlesService from "@/services/articles.service";

// ✅ Отключаем кеширование для динамических параметров
export const dynamic = 'force-dynamic';

/**
 * ========================================
 * СТРАНИЦА АВТОРА - СЕРВЕРНЫЙ КОМПОНЕНТ
 * ========================================
 * 
 * URL: /autori/jan-novak?page=2&sortBy=views
 * 
 * 1. Получаем slug автора из URL
 * 2. Загружаем данные автора
 * 3. Загружаем статьи автора с фильтрами
 * 4. Передаём всё в AuthorDetailPage
 */
export default async function AutorDetailPage({ params, searchParams }) {
    // ✅ ИЗМЕНЕНО: Получаем slug вместо meno
    const { slug } = await params; // slug автора: "jan-novak"
    const queryParams = await searchParams;

    // ✅ Берём параметры из URL
    const page = parseInt(queryParams?.page) || 1;
    const sortBy = queryParams?.sortBy || 'createdAt';
    const limit = 2; // Количество статей на странице

    let author = null;
    let articles = [];
    let total = 0;
    let totalPages = 1;

    console.log('📄 Author Page Params:', { slug, page, sortBy }); // ✅ ИЗМЕНЕНО: логируем slug

    // ✅ Загружаем данные автора
    try {
        const authorResponse = await usersService.getAuthorBySlug(slug);

        if (authorResponse?.success && authorResponse?.data) {
            author = authorResponse.data;
            console.log('✅ Author Loaded:', author.firstName, author.lastName, '| Slug:', author.slug);
        } else if (authorResponse && !authorResponse.success) {
            // ✅ НОВОЕ: Если API вернул структуру без success
            author = authorResponse;
            console.log('✅ Author Loaded:', author.firstName, author.lastName, '| Slug:', author.slug);
        } else {
            console.error('❌ Author not found or invalid response structure');
            // Можно добавить редирект на 404
        }
    } catch (error) {
        console.error('❌ Error loading author:', error);
        // Можно добавить редирект на 404
    }

    // ✅ Загружаем статьи автора
    if (author) {
        try {
            const filters = {
                page: page,
                limit: limit,
                sortBy: sortBy,
                author: author.id // Фильтруем по ID автора
            };

            console.log('🔍 Articles Filters:', filters);

            const articlesResponse = await articlesService.getAllArticles(filters);

            if (articlesResponse?.success && articlesResponse?.data) {
                articles = articlesResponse.data.articles || [];
                total = articlesResponse.data.total || 0;
                totalPages = articlesResponse.data.totalPages || 1;

                console.log('✅ Articles Loaded:', articles.length, 'articles | Total:', total);
            } else if (articlesResponse && !articlesResponse.success) {
                // ✅ НОВОЕ: Обработка прямой структуры ответа
                articles = articlesResponse.articles || [];
                total = articlesResponse.total || 0;
                totalPages = articlesResponse.totalPages || 1;

                console.log('✅ Articles Loaded:', articles.length, 'articles | Total:', total);
            }
        } catch (error) {
            console.error('❌ Error loading articles:', error);
        }
    }

    // Если автор не найден, показываем 404
    if (!author) {
        return (
            <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                <h1>Autor nenájdený</h1>
                <p>Autor s menom "{slug}" neexistuje.</p>
            </div>
        );
    }

    return (
        <AuthorDetailPage
            author={author}
            articles={articles}
            currentPage={page}
            totalPages={totalPages}
            total={total}
        />
    );
}