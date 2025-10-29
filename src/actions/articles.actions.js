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

// ========================================
// ПУБЛИЧНЫЕ ДЕЙСТВИЯ (без авторизации)
// ========================================

/**
 * Получить все опубликованные статьи
 * @param {Object} filters - Фильтры (category, tags, page, limit, sort)
 * @returns {Promise<Object>} - Результат операции с данными
 */
export async function getAllArticles(filters = {}) {
    try {
        const articles = await articlesService.getAllArticles(filters);
        return {
            success: true,
            data: articles
        };
    } catch (error) {
        console.error('[Server Action] getAllArticles error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка получения статей'
        };
    }
}

/**
 * Получить статью по slug
 * @param {string} slug - Slug статьи
 * @returns {Promise<Object>} - Результат операции
 */
export async function getArticleBySlug(slug) {
    try {
        if (!slug) {
            return {
                success: false,
                message: 'Slug не указан'
            };
        }

        const article = await articlesService.getArticleBySlug(slug);
        return {
            success: true,
            data: article
        };
    } catch (error) {
        console.error('[Server Action] getArticleBySlug error:', error);
        return {
            success: false,
            message: error.message || 'Статья не найдена'
        };
    }
}

/**
 * Получить статью по ID
 * @param {string} id - ID статьи
 * @returns {Promise<Object>} - Результат операции
 */
export async function getArticleById(id) {
    try {
        if (!id) {
            return {
                success: false,
                message: 'ID не указан'
            };
        }

        const article = await articlesService.getArticleById(id);
        return {
            success: true,
            data: article
        };
    } catch (error) {
        console.error('[Server Action] getArticleById error:', error);
        return {
            success: false,
            message: error.message || 'Статья не найдена'
        };
    }
}

/**
 * Поиск статей
 * @param {string} query - Поисковый запрос
 * @param {Object} filters - Дополнительные фильтры
 * @returns {Promise<Object>} - Результат поиска
 */
export async function searchArticles(query, filters = {}) {
    try {
        if (!query || query.trim().length < 2) {
            return {
                success: false,
                message: 'Запрос должен содержать минимум 2 символа'
            };
        }

        const results = await articlesService.searchArticles(query, filters);
        return {
            success: true,
            data: results
        };
    } catch (error) {
        console.error('[Server Action] searchArticles error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка поиска'
        };
    }
}

/**
 * Получить популярные статьи
 * @param {number} limit - Количество статей
 * @returns {Promise<Object>} - Результат операции
 */
export async function getPopularArticles(limit = 10) {
    try {
        const articles = await articlesService.getPopularArticles(limit);
        return {
            success: true,
            data: articles
        };
    } catch (error) {
        console.error('[Server Action] getPopularArticles error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка получения популярных статей'
        };
    }
}

/**
 * Увеличить количество просмотров статьи
 * @param {string} id - ID статьи
 * @returns {Promise<Object>} - Результат операции
 */
export async function incrementArticleViews(id) {
    try {
        if (!id) {
            return {
                success: false,
                message: 'ID статьи не указан'
            };
        }

        await articlesService.incrementViews(id);
        return {
            success: true,
            message: 'Просмотр засчитан'
        };
    } catch (error) {
        console.error('[Server Action] incrementArticleViews error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка увеличения просмотров'
        };
    }
}

// ========================================
// ПРИВАТНЫЕ ДЕЙСТВИЯ (author/admin)
// ========================================

/**
 * Создать новую статью
 * @param {Object} data - Данные статьи из формы
 * @returns {Promise<Object>} - Результат операции
 */
export async function createArticle(data) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Не авторизован'
            };
        }

        // Валидация обязательных полей (БЕЗ SLUG!)
        if (!data.title || data.title.trim().length < 10) {
            return {
                success: false,
                message: 'Заголовок должен содержать минимум 10 символов'
            };
        }

        if (!data.excerpt || data.excerpt.trim().length < 150) {
            return {
                success: false,
                message: 'Краткое описание должно содержать минимум 150 символов'
            };
        }

        if (!data.content || data.content.trim().length < 500) {
            return {
                success: false,
                message: 'Содержимое статьи должно содержать минимум 500 символов'
            };
        }

        if (!data.category) {
            return {
                success: false,
                message: 'Категория обязательна'
            };
        }

        const article = await articlesService.createArticle(data, token);

        return {
            success: true,
            data: article,
            message: 'Статья успешно создана'
        };
    } catch (error) {
        console.error('[Server Action] createArticle error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка создания статьи'
        };
    }
}

/**
 * Обновить статью
 * @param {string} id - ID статьи
 * @param {Object} data - Обновлённые данные
 * @returns {Promise<Object>} - Результат операции
 */
export async function updateArticle(id, data) {
    try {
        const token = await getAuthToken();

        // ✅ ДОБАВЬ ЛОГИРОВАНИЕ:
        console.log('🟢 [Server Action] updateArticle вызван:', {
            id,
            hasToken: !!token,
            dataKeys: Object.keys(data)
        });

        if (!token) {
            return {
                success: false,
                message: 'Не авторизован'
            };
        }

        if (!id) {
            return {
                success: false,
                message: 'ID статьи не указан'
            };
        }

        const article = await articlesService.updateArticle(id, data, token);

        // ✅ ДОБАВЬ ЛОГИРОВАНИЕ ОТВЕТА:
        console.log('🟢 [Server Action] updateArticle успешно:', article._id);

        return {
            success: true,
            data: article,
            message: 'Статья успешно обновлена'
        };
    } catch (error) {
        // ✅ ДОБАВЬ ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ОШИБКИ:
        console.error('❌ [Server Action] updateArticle error:', {
            message: error.message,
            stack: error.stack
        });
        return {
            success: false,
            message: error.message || 'Ошибка обновления статьи'
        };
    }
}

/**
 * Удалить статью
 * @param {string} id - ID статьи
 * @returns {Promise<Object>} - Результат операции
 */
export async function deleteArticle(id) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Не авторизован'
            };
        }

        if (!id) {
            return {
                success: false,
                message: 'ID статьи не указан'
            };
        }

        await articlesService.deleteArticle(id, token);

        return {
            success: true,
            message: 'Статья успешно удалена'
        };
    } catch (error) {
        console.error('[Server Action] deleteArticle error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка удаления статьи'
        };
    }
}

/**
 * Отправить статью на модерацию
 * @param {string} id - ID статьи
 * @returns {Promise<Object>} - Результат операции
 */
export async function submitArticleForReview(id) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Не авторизован'
            };
        }

        if (!id) {
            return {
                success: false,
                message: 'ID статьи не указан'
            };
        }

        const article = await articlesService.submitForReview(id, token);

        return {
            success: true,
            data: article,
            message: 'Статья отправлена на модерацию'
        };
    } catch (error) {
        console.error('[Server Action] submitArticleForReview error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка отправки на модерацию'
        };
    }
}

export async function getMyArticles(status = 'all') {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Не авторизован'
            };
        }

        // ИСПРАВЛЕНО: используем getMyArticles вместо getUserArticles
        const articles = await articlesService.getMyArticles(status, token);

        return {
            success: true,
            data: articles
        };
    } catch (error) {
        console.error('[Server Action] getMyArticles error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка получения статей'
        };
    }
}

// ========================================
// ДЕЙСТВИЯ ДЛЯ АДМИНА
// ========================================

/**
 * Одобрить статью (admin)
 * @param {string} id - ID статьи
 * @returns {Promise<Object>} - Результат операции
 */
export async function approveArticle(id) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Не авторизован'
            };
        }

        if (!id) {
            return {
                success: false,
                message: 'ID статьи не указан'
            };
        }

        const article = await articlesService.approveArticle(id, token);

        return {
            success: true,
            data: article,
            message: 'Статья одобрена и опубликована'
        };
    } catch (error) {
        console.error('[Server Action] approveArticle error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка одобрения статьи'
        };
    }
}

/**
 * Отклонить статью (admin)
 * @param {string} id - ID статьи
 * @param {string} reason - Причина отклонения
 * @returns {Promise<Object>} - Результат операции
 */
export async function rejectArticle(id, reason) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Не авторизован'
            };
        }

        if (!id) {
            return {
                success: false,
                message: 'ID статьи не указан'
            };
        }

        const article = await articlesService.rejectArticle(id, reason, token);

        return {
            success: true,
            data: article,
            message: 'Статья отклонена'
        };
    } catch (error) {
        console.error('[Server Action] rejectArticle error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка отклонения статьи'
        };
    }
}

/**
 * Получить статьи на модерации (admin)
 * @returns {Promise<Object>} - Результат операции
 */
export async function getPendingArticles() {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Не авторизован'
            };
        }

        const articles = await articlesService.getPendingArticles(token);

        return {
            success: true,
            data: articles
        };
    } catch (error) {
        console.error('[Server Action] getPendingArticles error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка получения статей на модерации'
        };
    }
}

/**
 * Получить все статьи для админа (с фильтрами)
 * @param {Object} filters - Фильтры
 * @returns {Promise<Object>} - Результат операции
 */
export async function getAllArticlesForAdmin(filters = {}) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Не авторизован'
            };
        }

        const result = await articlesService.getAllArticlesForAdmin(filters, token);

        return {
            success: true,
            data: result
        };
    } catch (error) {
        console.error('[Server Action] getAllArticlesForAdmin error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка получения статей'
        };
    }
}