import api from '@/lib/serverApiClient';

/**
 * CommentsService - сервис для работы с комментариями
 * Все методы возвращают Promise с данными или ошибкой
 */
class CommentsService {
    /**
     * Получить комментарии к статье (публичный доступ)
     * @param {string} articleId - ID статьи
     * @param {Object} options - Опции (page, limit, sort)
     * @returns {Promise<Object>} - Список комментариев с пагинацией
     */
    async getArticleComments(articleId, options = {}) {
        const params = new URLSearchParams();

        if (options.page) params.append('page', options.page);
        if (options.limit) params.append('limit', options.limit);
        if (options.sort) params.append('sort', options.sort);

        const response = await api.get(`/api/comments/article/${articleId}?${params.toString()}`);
        return response.data;
    }

    /**
     * Получить комментарий по ID (публичный доступ)
     * @param {string} id - ID комментария
     * @returns {Promise<Object>} - Данные комментария
     */
    async getCommentById(id) {
        const response = await api.get(`/api/comments/${id}`);
        return response.data;
    }

    /**
     * Создать комментарий (авторизованный пользователь)
     * @param {Object} data - Данные комментария
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Созданный комментарий
     */
    async createComment(data, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.post('/api/comments', data, config);
        return response.data;
    }

    /**
     * Обновить комментарий (owner)
     * @param {string} id - ID комментария
     * @param {Object} data - Обновлённые данные
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Обновлённый комментарий
     */
    async updateComment(id, data, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.put(`/api/comments/${id}`, data, config);
        return response.data;
    }

    /**
     * Удалить комментарий (owner/admin)
     * @param {string} id - ID комментария
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Результат удаления
     */
    async deleteComment(id, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.delete(`/api/comments/${id}`, config);
        return response.data;
    }

    /**
     * Получить все комментарии в системе (admin)
     * @param {Object} filters - Фильтры (page, limit, sort, article, author)
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Список комментариев с пагинацией
     */
    async getAllComments(filters = {}, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const params = new URLSearchParams();

        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.article) params.append('article', filters.article);
        if (filters.author) params.append('author', filters.author);

        const response = await api.get(`/api/comments/all/list?${params.toString()}`, config);
        return response.data;
    }

    /**
     * Модерация комментария - удаление (admin)
     * @param {string} id - ID комментария
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Результат модерации
     */
    async moderateComment(id, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.delete(`/api/comments/${id}/moderate`, config);
        return response.data;
    }

    /**
     * Получить комментарии пользователя (для профиля)
     * @param {string} userId - ID пользователя
     * @param {Object} options - Опции (page, limit)
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Список комментариев пользователя
     */
    async getUserComments(userId, options = {}, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const params = new URLSearchParams({ author: userId });

        if (options.page) params.append('page', options.page);
        if (options.limit) params.append('limit', options.limit);

        const response = await api.get(`/api/comments?${params.toString()}`, config);
        return response.data;
    }

    /**
     * Получить количество комментариев к статье
     * @param {string} articleId - ID статьи
     * @returns {Promise<number>} - Количество комментариев
     */
    async getCommentsCount(articleId) {
        try {
            const response = await api.get(`/api/comments/article/${articleId}?limit=1`);
            return response.data?.total || 0;
        } catch (error) {
            console.error('Error getting comments count:', error);
            return 0;
        }
    }
}

// Экспортируем singleton instance
export default new CommentsService();