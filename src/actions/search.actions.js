"use server";

import articlesService from "@/services/articles.service";

/**
 * Server Action для поиска статей
 * @param {string} query - Поисковый запрос
 * @returns {Promise<Object>} - Результаты поиска (топ-5 по просмотрам)
 */
export async function searchArticlesAction(query) {
    try {
        // Валидация
        if (!query || query.trim().length === 0) {
            return {
                success: false,
                data: [],
                message: 'Prázdny vyhľadávací dotaz'
            };
        }

        // Минимальная длина запроса (опционально)
        if (query.trim().length < 2) {
            return {
                success: false,
                data: [],
                message: 'Dotaz musí mať aspoň 2 znaky'
            };
        }

        // Запрос к articlesService
        const result = await articlesService.searchArticles(query, {
            limit: 5, // Топ-5 статей
            // Backend автоматически сортирует по views (descending)
        });

        // Проверка результата
        if (!result || !result.data) {
            return {
                success: false,
                data: [],
                message: 'Chyba pri vyhľadávaní'
            };
        }

        return {
            success: true,
            data: result.data.articles || result.data || [],
            total: result.data.total || 0
        };

    } catch (error) {
        console.error('❌ Search Action Error:', error);

        return {
            success: false,
            data: [],
            message: error.message || 'Nastala chyba pri vyhľadávaní'
        };
    }
}