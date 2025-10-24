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
 * Создать комментарий
 * @param {string} articleId - ID статьи
 * @param {string} content - Текст комментария
 * @returns {Promise<Object>} - Результат операции
 */
export async function createComment(articleId, content) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        if (!articleId) {
            return {
                success: false,
                message: 'ID článku nie je zadané'
            };
        }

        if (!content || content.trim().length < 3) {
            return {
                success: false,
                message: 'Komentár musí obsahovať minimálne 3 znaky'
            };
        }

        if (content.trim().length > 1000) {
            return {
                success: false,
                message: 'Komentár nesmie presiahnuť 1000 znakov'
            };
        }

        const commentData = {
            article: articleId,
            content: content.trim()
        };

        const comment = await commentsService.createComment(commentData, token);

        return {
            success: true,
            data: comment,
            message: 'Komentár bol úspešne pridaný'
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
 * @param {string} content - Новый текст комментария
 * @returns {Promise<Object>} - Результат операции
 */
export async function updateComment(id, content) {
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

        if (!content || content.trim().length < 3) {
            return {
                success: false,
                message: 'Komentár musí obsahovať minimálne 3 znaky'
            };
        }

        if (content.trim().length > 1000) {
            return {
                success: false,
                message: 'Komentár nesmie presiahnuť 1000 znakov'
            };
        }

        const commentData = {
            content: content.trim()
        };

        const comment = await commentsService.updateComment(id, commentData, token);

        return {
            success: true,
            data: comment,
            message: 'Komentár bol úspešne upravený'
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