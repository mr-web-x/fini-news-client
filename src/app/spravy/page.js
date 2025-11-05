import NewsListPage from "@/features/PublicPages/NewsListPage/NewsListPage";
import articlesService from "@/services/articles.service";
import categoriesService from "@/services/categories.service";

export default async function SpravyPage({ searchParams }) {
    // Получаем параметры из URL
    const params = await searchParams;
    const category = params?.category || null;
    const sortBy = params?.sortBy || 'createdAt';
    const page = parseInt(params?.page) || 1;
    const limit = 18; // 18 статей на страницу

    // Загружаем данные на сервере
    let articles = [];
    let total = 0;
    let categories = [];
    let topArticles = [];

    try {
        // Получаем статьи с фильтрами
        const articlesResponse = await articlesService.getAllArticles({
            category: category,
            page: page,
            limit: limit,
            sort: sortBy === 'views' ? '-views' : sortBy === 'popular' ? '-views' : '-createdAt'
        });

        articles = articlesResponse?.articles || [];
        total = articlesResponse?.total || 0;
    } catch (error) {
        console.error('Error loading articles:', error);
    }

    try {
        // Получаем все категории для табов
        const categoriesResponse = await categoriesService.getAllCategories();

        if (Array.isArray(categoriesResponse)) {
            categories = categoriesResponse;
        } else if (categoriesResponse?.data && Array.isArray(categoriesResponse.data)) {
            categories = categoriesResponse.data;
        } else if (categoriesResponse?.categories && Array.isArray(categoriesResponse.categories)) {
            categories = categoriesResponse.categories;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }

    try {
        // Получаем топ 5 статей для сайдбара
        const topArticlesResponse = await articlesService.getAllArticles({
            limit: 5,
            sort: '-views'
        });

        topArticles = topArticlesResponse?.articles || [];
    } catch (error) {
        console.error('Error loading top articles:', error);
    }

    // Вычисляем общее количество страниц
    const totalPages = Math.ceil(total / limit);

    return (
        <NewsListPage
            articles={articles}
            categories={categories}
            topArticles={topArticles}
            currentPage={page}
            totalPages={totalPages}
            selectedCategory={category}
            selectedSort={sortBy}
        />
    );
}