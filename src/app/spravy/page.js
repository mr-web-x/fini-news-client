// src/app/spravy/page.js
import NewsListPage from "@/features/PublicPages/NewsListPage/NewsListPage";
import articlesService from "@/services/articles.service";
import categoriesService from "@/services/categories.service";

/**
 * ========================================
 * УПРОЩЁННАЯ ВЕРСИЯ - БЕЗ ФРОНТЕНД ЛОГИКИ
 * ========================================
 * 
 * Теперь Frontend просто:
 * 1. Собирает параметры из URL
 * 2. Отправляет их на Backend КАК ЕСТЬ
 * 3. Backend сам фильтрует и сортирует
 * 
 * Пример URL: /spravy?sortBy=views&category=banky&page=2
 */
export default async function SpravyPage({ searchParams }) {
    const params = await searchParams;

    // ✅ НОВОЕ: Просто берём параметры из URL как есть
    const categorySlug = params?.category || null;  // "banky"
    const sortBy = params?.sortBy || 'createdAt';   // "views", "createdAt", "title"
    const page = parseInt(params?.page) || 1;
    const limit = 2; // Количество статей на странице

    let articles = [];
    let total = 0;
    let categories = [];
    let topArticles = [];

    console.log('📄 URL Params:', { categorySlug, sortBy, page });

    // Загружаем категории (для отображения фильтров)
    try {
        const categoriesResponse = await categoriesService.getAllCategories();

        if (categoriesResponse?.success && categoriesResponse?.data?.categories) {
            categories = categoriesResponse.data.categories;
        } else if (Array.isArray(categoriesResponse)) {
            categories = categoriesResponse;
        } else if (categoriesResponse?.data && Array.isArray(categoriesResponse.data)) {
            categories = categoriesResponse.data;
        } else if (categoriesResponse?.categories && Array.isArray(categoriesResponse.categories)) {
            categories = categoriesResponse.categories;
        }

    } catch (error) {
        console.error('Error loading categories:', error);
    }

    // ✅ НОВОЕ: Загружаем статьи - просто передаём параметры как есть
    try {
        const filters = {
            page: page,           // Страница
            limit: limit,         // Лимит на странице
            sortBy: sortBy,       // Сортировка: "views", "createdAt", "title"
            category: categorySlug // Категория по slug: "banky", "akcie" и т.д.
        };

        console.log('🔍 Filters to Backend:', filters);

        const articlesResponse = await articlesService.getAllArticles(filters);

        articles = articlesResponse?.articles || [];
        total = articlesResponse?.total || 0;

        console.log('✅ Loaded:', articles.length, 'articles | Total:', total);

    } catch (error) {
        console.error('Error loading articles:', error);
    }

    // Загружаем топ статьи (популярные)
    try {
        const topArticlesResponse = await articlesService.getAllArticles({
            limit: 5,
            sortBy: 'views' // Сортировка по просмотрам для топа
        });

        topArticles = topArticlesResponse?.articles || [];

    } catch (error) {
        console.error('Error loading top articles:', error);
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <NewsListPage
            articles={articles}
            categories={categories}
            topArticles={topArticles}
            currentPage={page}
            totalPages={totalPages}
            selectedCategory={categorySlug}  // Передаём slug как есть
            selectedSort={sortBy}             // Передаём sortBy как есть
        />
    );
}