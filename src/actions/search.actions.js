"use server";

import { searchArticles } from '@/actions/articles.actions';

/**
 * Server Action для поиска статей в Header
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

        if (query.trim().length < 2) {
            return {
                success: false,
                data: [],
                message: 'Dotaz musí mať aspoň 2 znaky'
            };
        }

        // ✅ ИСПОЛЬЗУЕМ существующий action из articles.actions
        const result = await searchArticles(query, {
            limit: 5  // Топ-5 статей для dropdown
        });

        console.log('🔍 Search result:', result);

        // Проверка успешности
        if (!result.success) {
            return {
                success: false,
                data: [],
                message: result.message || 'Chyba pri vyhľadávaní'
            };
        }

        // ✅ ИСПРАВЛЕНО: Берём данные из result.data
        const articles = Array.isArray(result.data) ? result.data : [];

        return {
            success: true,
            data: articles,
            total: articles.length
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