import api from '@/lib/serverApiClient';

/**
 * ArticlesService - сервис для работы со статьями
 * Все методы возвращают Promise с данными или ошибкой
 */
class ArticlesService {
    /**
     * Получить все опубликованные статьи (публичный доступ)
     * @param {Object} filters - Фильтры (category, tags, page, limit, sort)
     * @returns {Promise<Object>} - Список статей с пагинацией
     */
    async getAllArticles(filters = {}) {
        const params = new URLSearchParams();

        if (filters.category) params.append('category', filters.category);
        if (filters.tags) params.append('tags', filters.tags);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.sort) params.append('sort', filters.sort);

        const response = await api.get(`/api/articles?${params.toString()}`);
        return response.data;
    }

    /**
     * Получить статью по slug (публичный доступ)
     * @param {string} slug - Slug статьи
     * @returns {Promise<Object>} - Данные статьи
     */
    async getArticleBySlug(slug) {
        const response = await api.get(`/api/articles/slug/${slug}`);
        return response.data;
    }

    /**
     * Получить статью по ID (публичный доступ)
     * @param {string} id - ID статьи
     * @returns {Promise<Object>} - Данные статьи
     */
    async getArticleById(id) {
        const response = await api.get(`/api/articles/${id}`);
        return response.data;
    }

    /**
     * Поиск статей (публичный доступ)
     * @param {string} query - Поисковый запрос
     * @param {Object} filters - Дополнительные фильтры
     * @returns {Promise<Object>} - Результаты поиска
     */
    async searchArticles(query, filters = {}) {
        const params = new URLSearchParams({ q: query });

        if (filters.category) params.append('category', filters.category);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await api.get(`/api/articles/search?${params.toString()}`);
        return response.data;
    }

    /**
     * Получить популярные статьи (публичный доступ)
     * @param {number} limit - Количество статей
     * @returns {Promise<Array>} - Массив популярных статей
     */
    async getPopularArticles(limit = 10) {
        const response = await api.get(`/api/articles/popular/list?limit=${limit}`);
        return response.data;
    }

    /**
     * Создать новую статью (author/admin)
     * @param {Object} data - Данные статьи
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Созданная статья
     */
    async createArticle(data, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.post('/api/articles', data, config);
        return response.data;
    }

    /**
     * Обновить статью (owner/admin)
     * @param {string} id - ID статьи
     * @param {Object} data - Обновлённые данные
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Обновлённая статья
     */
    async updateArticle(id, data, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.put(`/api/articles/${id}`, data, config);
        return response.data;
    }

    /**
     * Удалить статью (owner/admin)
     * @param {string} id - ID статьи
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Результат удаления
     */
    async deleteArticle(id, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.delete(`/api/articles/${id}`, config);
        return response.data;
    }

    /**
     * Отправить статью на модерацию (owner)
     * @param {string} id - ID статьи
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Обновлённая статья
     */
    async submitForReview(id, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.post(`/api/articles/${id}/submit`, {}, config);
        return response.data;
    }

    /**
     * Одобрить статью (admin)
     * @param {string} id - ID статьи
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Одобренная статья
     */
    async approveArticle(id, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.post(`/api/articles/${id}/approve`, {}, config);
        return response.data;
    }

    /**
     * Отклонить статью (admin)
     * @param {string} id - ID статьи
     * @param {string} moderationNote - Причина отклонения
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Отклонённая статья
     */
    async rejectArticle(id, moderationNote, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.post(`/api/articles/${id}/reject`, { moderationNote }, config);
        return response.data;
    }

    /**
     * Получить статьи на модерации (admin)
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Array>} - Массив статей на модерации
     */
    async getPendingArticles(token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.get('/api/articles/pending/list', config);
        return response.data;
    }

    /**
     * Увеличить количество просмотров статьи
     * @param {string} id - ID статьи
     * @returns {Promise<Object>} - Результат операции
     */
    async incrementViews(id) {
        const response = await api.put(`/api/articles/${id}/views`);
        return response.data;
    }

    /**
     * Получить статьи конкретного пользователя (owner/admin)
     * @param {string} userId - ID пользователя
     * @param {string} status - Статус статей (draft, pending, published, rejected, all)
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Array>} - Массив статей пользователя
     */
    async getUserArticles(userId, status = 'all', token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const params = new URLSearchParams({ author: userId });
        if (status !== 'all') {
            params.append('status', status);
        }

        const response = await api.get(`/api/articles?${params.toString()}`, config);
        return response.data;
    }

    /**
     * Получить все статьи в системе с фильтрами (admin)
     * @param {Object} filters - Фильтры (status, author, search, page, limit, sort)
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Список статей с пагинацией
     */
    async getAllArticlesForAdmin(filters = {}, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const params = new URLSearchParams();

        if (filters.status) params.append('status', filters.status);
        if (filters.author) params.append('author', filters.author);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.sort) params.append('sort', filters.sort);

        const response = await api.get(`/api/articles?${params.toString()}`, config);
        return response.data;
    }
}

// Экспортируем singleton instance
export default new ArticlesService();