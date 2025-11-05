// src/app/spravy/page.js
import NewsListPage from "@/features/PublicPages/NewsListPage/NewsListPage";
import articlesService from "@/services/articles.service";
import categoriesService from "@/services/categories.service";

export default async function SpravyPage({ searchParams }) {
    const params = await searchParams;
    const categorySlug = params?.category || null;
    const sortBy = params?.sortBy || 'createdAt';
    const page = parseInt(params?.page) || 1;
    const limit = 18;

    let articles = [];
    let total = 0;
    let categories = [];
    let topArticles = [];
    let selectedCategoryId = null;

    // Загружаем категории
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

        // Находим ID категории по slug
        if (categorySlug && categories.length > 0) {
            const foundCategory = categories.find(cat => cat.slug === categorySlug);
            if (foundCategory) {
                selectedCategoryId = foundCategory._id;
            }
        }

    } catch (error) {
        console.error('Error loading categories:', error);
    }

    // Загружаем статьи
    try {
        const filters = {
            page: page,
            limit: limit,
            sort: sortBy === 'views' ? '-views' : sortBy === 'popular' ? '-views' : '-createdAt'
        };

        if (selectedCategoryId) {
            filters.category = selectedCategoryId;
        }

        const articlesResponse = await articlesService.getAllArticles(filters);

        articles = articlesResponse?.articles || [];
        total = articlesResponse?.total || 0;

    } catch (error) {
        console.error('Error loading articles:', error);
    }

    // Загружаем топ статьи
    try {
        const topArticlesResponse = await articlesService.getAllArticles({
            limit: 5,
            sort: '-views'
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
            selectedCategory={categorySlug}
            selectedSort={sortBy}
        />
    );
}