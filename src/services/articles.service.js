import api from '@/lib/serverApiClient';

/**
 * ArticlesService - сервис для работы со статьями
 * Все методы возвращают Promise с данными или ошибкой
 */
class ArticlesService {

    async getAllArticles(filters = {}) {
        const params = new URLSearchParams();

        // ✅ НОВОЕ: Отправляем параметры как есть, без преобразований

        // Пагинация
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        // Сортировка (простая строка)
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        // Фильтрация
        if (filters.category) params.append('category', filters.category); // slug
        if (filters.author) params.append('author', filters.author);
        if (filters.search) params.append('search', filters.search);
        if (filters.tags) params.append('tags', filters.tags);
        if (filters.days) params.append('days', filters.days);

        // ❌ УДАЛЕНО: skip и sort больше не нужны
        // Frontend не вычисляет skip
        // Frontend не преобразует sortBy в sort

        console.log('📤 Sending to Backend:', params.toString());

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
     * Обновить статью (author/admin)
     * @param {string} id - ID статьи
     * @param {Object} data - Обновляемые данные
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
     * Удалить статью (author/admin)
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
     * Отправить статью на модерацию (author)
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
     * ✅ ИСПРАВЛЕНО: Отклонить статью (admin)
     * @param {string} id - ID статьи
     * @param {string} reason - Причина отклонения
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Отклонённая статья
     */
    async rejectArticle(id, reason, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        // ✅ ИСПРАВЛЕНО: Отправляем { reason } вместо { moderationNote }
        const response = await api.post(`/api/articles/${id}/reject`, { reason }, config);
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
     * Получить статьи ТЕКУЩЕГО пользователя
     * @param {string} status - Статус статей (draft, pending, published, rejected, all)
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Статьи текущего пользователя
     */
    async getMyArticles(status = 'all', token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const params = new URLSearchParams();
        if (status && status !== 'all') {
            params.append('status', status);
        }

        const queryString = params.toString();
        const url = queryString
            ? `/api/articles/me?${queryString}`
            : `/api/articles/me`;

        const response = await api.get(url, config);
        return response.data;
    }

    /**
     * Получить статьи конкретного пользователя по ID (для админа)
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

        const params = new URLSearchParams();
        if (status && status !== 'all') {
            params.append('status', status);
        }

        const queryString = params.toString();
        const url = queryString
            ? `/api/articles/author/${userId}?${queryString}`
            : `/api/articles/author/${userId}`;

        const response = await api.get(url, config);
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

        const response = await api.get(`/api/articles/admin/all?${params.toString()}`, config);
        return response.data;
    }
}

// Экспортируем singleton instance
export default new ArticlesService();