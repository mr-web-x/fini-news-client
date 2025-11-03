"use server";

import { cookies } from 'next/headers';
import commentsService from '@/services/comments.service';

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
 * Получить комментарии к статье
 * @param {string} articleId - ID статьи
 * @param {Object} options - Опции (page, limit, sort)
 * @returns {Promise<Object>} - Результат операции
 */
export async function getArticleComments(articleId, options = {}) {
    try {
        if (!articleId) {
            return {
                success: false,
                message: 'ID článku nie je zadané'
            };
        }

        const comments = await commentsService.getArticleComments(articleId, options);
        return {
            success: true,
            data: comments
        };
    } catch (error) {
        console.error('[Server Action] getArticleComments error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri načítavaní komentárov'
        };
    }
}

/**
 * Получить количество комментариев к статье
 * @param {string} articleId - ID статьи
 * @returns {Promise<Object>} - Результат операции
 */
export async function getCommentsCount(articleId) {
    try {
        if (!articleId) {
            return {
                success: false,
                message: 'ID článku nie je zadané'
            };
        }

        const count = await commentsService.getCommentsCount(articleId);
        return {
            success: true,
            data: { count }
        };
    } catch (error) {
        console.error('[Server Action] getCommentsCount error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri počítaní komentárov'
        };
    }
}

/**
 * Получить комментарий по ID
 * @param {string} id - ID комментария
 * @returns {Promise<Object>} - Результат операции
 */
export async function getCommentById(id) {
    try {
        if (!id) {
            return {
                success: false,
                message: 'ID komentára nie je zadané'
            };
        }

        const comment = await commentsService.getCommentById(id);
        return {
            success: true,
            data: comment
        };
    } catch (error) {
        console.error('[Server Action] getCommentById error:', error);
        return {
            success: false,
            message: error.message || 'Komentár nenájdený'
        };
    }
}

// ========================================
// ПРИВАТНЫЕ ДЕЙСТВИЯ (авторизованные пользователи)
// ========================================

/**
 * ✅ ИСПРАВЛЕННАЯ функция createComment
 * 
 * ИЗМЕНЕНИЯ:
 * 1. Принимает ОБЪЕКТ data вместо двух параметров
 * 2. Извлекает article и content из объекта
 * 3. Добавлены логи для отладки
 */
export async function createComment(data) {
    try {
        console.log('🔍 [createComment] Received data:', data);

        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        // ✅ Извлекаем article и content из объекта data
        const { article: articleId, content } = data;

        if (!articleId) {
            console.log('❌ [createComment] Missing articleId');
            return {
                success: false,
                message: 'ID článku nie je zadané'
            };
        }

        if (!content || typeof content !== 'string') {
            console.log('❌ [createComment] Invalid content:', content);
            return {
                success: false,
                message: 'Komentár je povinný'
            };
        }

        const trimmedContent = content.trim();
        console.log('🔍 [createComment] Trimmed content length:', trimmedContent.length);

        if (trimmedContent.length < 3) {
            console.log('❌ [createComment] Content too short:', trimmedContent.length);
            return {
                success: false,
                message: 'Komentár musí obsahovať minimálne 3 znaky'
            };
        }

        if (trimmedContent.length > 2000) {
            console.log('❌ [createComment] Content too long:', trimmedContent.length);
            return {
                success: false,
                message: 'Komentár nesmie presiahnuť 2000 znakov'
            };
        }

        const commentData = {
            article: articleId,
            content: trimmedContent
        };

        console.log('✅ [createComment] Sending to backend:', commentData);

        const comment = await commentsService.createComment(commentData, token);

        console.log('✅ [createComment] Success! Comment created:', comment);

        return {
            success: true,
            data: comment,
            message: 'Komentár bol pridaný'
        };
    } catch (error) {
        console.error('[Server Action] createComment error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri vytváraní komentára'
        };
    }
}

/**
 * Обновить комментарий
 * @param {string} id - ID комментария
 * @param {Object} data - Обновлённые данные
 * @returns {Promise<Object>} - Результат операции
 */
export async function updateComment(id, data) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        if (!id) {
            return {
                success: false,
                message: 'ID komentára nie je zadané'
            };
        }

        if (!data.content || data.content.trim().length < 3) {
            return {
                success: false,
                message: 'Komentár musí obsahovať minimálne 3 znaky'
            };
        }

        const comment = await commentsService.updateComment(id, data, token);

        return {
            success: true,
            data: comment,
            message: 'Komentár bol upravený'
        };
    } catch (error) {
        console.error('[Server Action] updateComment error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri úprave komentára'
        };
    }
}

/**
 * Удалить комментарий
 * @param {string} id - ID комментария
 * @returns {Promise<Object>} - Результат операции
 */
export async function deleteComment(id) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        if (!id) {
            return {
                success: false,
                message: 'ID komentára nie je zadané'
            };
        }

        await commentsService.deleteComment(id, token);

        return {
            success: true,
            message: 'Komentár bol vymazaný'
        };
    } catch (error) {
        console.error('[Server Action] deleteComment error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri mazaní komentára'
        };
    }
}

/**
 * Получить комментарии пользователя
 * @param {string} userId - ID пользователя
 * @param {Object} options - Опции (page, limit)
 * @returns {Promise<Object>} - Результат операции
 */
export async function getUserComments(userId, options = {}) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        if (!userId) {
            return {
                success: false,
                message: 'ID používateľa nie je zadané'
            };
        }

        const comments = await commentsService.getUserComments(userId, options, token);

        return {
            success: true,
            data: comments
        };
    } catch (error) {
        console.error('[Server Action] getUserComments error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri načítavaní komentárov používateľa'
        };
    }
}

// ========================================
// ДЕЙСТВИЯ ДЛЯ АДМИНА
// ========================================

/**
 * Получить все комментарии в системе (admin)
 * @param {Object} filters - Фильтры (page, limit, sort, article, author)
 * @returns {Promise<Object>} - Результат операции
 */
export async function getAllCommentsForAdmin(filters = {}) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        const comments = await commentsService.getAllComments(filters, token);

        return {
            success: true,
            data: comments
        };
    } catch (error) {
        console.error('[Server Action] getAllCommentsForAdmin error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri načítavaní komentárov'
        };
    }
}

/**
 * Модерация комментария - удаление (admin)
 * @param {string} id - ID комментария
 * @returns {Promise<Object>} - Результат операции
 */
export async function moderateComment(id) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        if (!id) {
            return {
                success: false,
                message: 'ID komentára nie je zadané'
            };
        }

        await commentsService.moderateComment(id, token);

        return {
            success: true,
            message: 'Komentár bol vymazaný moderátorom'
        };
    } catch (error) {
        console.error('[Server Action] moderateComment error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri moderácii komentára'
        };
    }
}

/**
 * Получить мои комментарии (текущего пользователя)
 * @param {Object} options - Опции (page, limit)
 * @returns {Promise<Object>} - Результат операции
 */
export async function getMyComments(options = {}) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        // Используем 'me' как userId - backend сам определит пользователя по токену
        const comments = await commentsService.getUserComments('me', options, token);

        return {
            success: true,
            data: comments
        };
    } catch (error) {
        console.error('[Server Action] getMyComments error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri načítavaní vašich komentárov'
        };
    }
}

/**
 * ✅ НОВАЯ ФУНКЦИЯ: Получить статистику комментариев
 * - Для admin: общее количество ВСЕХ комментариев в системе
 * - Для author/user: количество СВОИХ комментариев
 * @param {string} userRole - Роль пользователя (admin, author, user)
 * @returns {Promise<Object>} - Результат операции с количеством комментариев
 */
export async function getUserCommentsStats(userRole) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        let result;

        // Для админа получаем ВСЕ комментарии в системе
        if (userRole === 'admin') {
            result = await commentsService.getAllComments({ limit: 1000 }, token);
        } else {
            // Для обычных пользователей - только свои комментарии
            result = await commentsService.getUserComments('me', { limit: 1000 }, token);
        }

        // Подсчитываем общее количество
        const totalComments = result.pagination?.total || result.data?.length || result.comments?.length || 0;

        return {
            success: true,
            data: {
                totalComments
            }
        };
    } catch (error) {
        console.error('[Server Action] getUserCommentsStats error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri načítavaní statistiky komentárov'
        };
    }
}