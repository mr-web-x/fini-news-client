"use server";

import { cookies } from 'next/headers';
import articlesService from '@/services/articles.service';

/**
 * Получить JWT токен из cookies
 * @returns {string|null} - JWT токен или null
 */
async function getAuthToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    return token?.value || null;
}

/**
 * ✅ НОВАЯ ФУНКЦИЯ: Получить статистику статей и последние опубликованные статьи для Dashboard
 * @returns {Promise<Object>} - Результат операции со статистикой
 */
export async function getDashboardStats() {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        // Получаем все статьи пользователя для подсчета статистики
        const allArticlesResult = await articlesService.getMyArticles('all', token);

        if (!allArticlesResult) {
            return {
                success: false,
                message: 'Chyba pri načítavaní štatistiky'
            };
        }

        const allArticles = allArticlesResult.articles || allArticlesResult.data || allArticlesResult || [];

        // Подсчитываем статистику по статусам
        const publishedArticles = allArticles.filter(a => a.status === 'published');

        // Получаем последние 5 опубликованных статей, отсортированные по дате создания
        const recentPublished = publishedArticles
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(article => ({
                _id: article._id,
                title: article.title,
                slug: article.slug,
                createdAt: article.createdAt,
                views: article.views || 0
            }));

        return {
            success: true,
            data: {
                publishedCount: publishedArticles.length,
                recentArticles: recentPublished
            }
        };
    } catch (error) {
        console.error('[Server Action] getDashboardStats error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri načítavaní štatistiky článkov'
        };
    }
}