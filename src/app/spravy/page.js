// src/app/spravy/page.js
import NewsListPage from "@/features/PublicPages/NewsListPage/NewsListPage";
import articlesService from "@/services/articles.service";
import categoriesService from "@/services/categories.service";

export default async function SpravyPage({ searchParams }) {
    const params = await searchParams;
    const categorySlug = params?.category || null;
    const sortBy = params?.sortBy || 'createdAt';
    const page = parseInt(params?.page) || 1;
    const limit = 4; // Количество статей на странице

    let articles = [];
    let total = 0;
    let categories = [];
    let topArticles = [];
    let selectedCategoryId = null;

    // Вычисляем skip для пагинации
    const skip = (page - 1) * limit;

    // Определяем правильную сортировку для backend
    let sortValue;
    switch (sortBy) {
        case 'views':
            sortValue = '-views'; // От большего к меньшему (популярные сверху)
            break;
        case 'title':
            sortValue = 'title'; // От A до Z (без минуса)
            break;
        case 'createdAt':
        default:
            sortValue = '-createdAt'; // От новых к старым (минус = DESC)
            break;
    }

    console.log('📄 Page:', page, '| Skip:', skip, '| SortBy:', sortBy, '| Sort:', sortValue);

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
            skip: skip,
            limit: limit,
            sort: sortValue // ✅ Используем правильное значение
        };

        if (selectedCategoryId) {
            filters.category = selectedCategoryId;
        }

        console.log('🔍 Filters:', filters);

        const articlesResponse = await articlesService.getAllArticles(filters);

        articles = articlesResponse?.articles || [];
        total = articlesResponse?.total || 0;

        console.log('✅ Loaded:', articles.length, 'articles | Total:', total);

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