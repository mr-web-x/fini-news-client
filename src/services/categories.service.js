import api from '@/lib/serverApiClient';

/**
 * CategoriesService - сервис для работы с категориями
 * Все методы возвращают Promise с данными или ошибкой
 */
class CategoriesService {
    /**
     * Получить все категории (публичный доступ)
     * @returns {Promise<Array>} - Массив категорий
     */
    async getAllCategories() {
        const response = await api.get('/api/categories');
        return response.data;
    }

    /**
     * Получить категорию по ID (публичный доступ)
     * @param {string} id - ID категории
     * @returns {Promise<Object>} - Данные категории
     */
    async getCategoryById(id) {
        const response = await api.get(`/api/categories/${id}`);
        return response.data;
    }

    /**
     * Получить категорию по slug (публичный доступ)
     * @param {string} slug - Slug категории
     * @returns {Promise<Object>} - Данные категории
     */
    async getCategoryBySlug(slug) {
        const response = await api.get(`/api/categories/slug/${slug}`);
        return response.data;
    }

    /**
     * Создать новую категорию (admin)
     * @param {Object} data - Данные категории { name, slug, description }
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Созданная категория
     */
    async createCategory(data, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.post('/api/categories', data, config);
        return response.data;
    }

    /**
     * Обновить категорию (admin)
     * @param {string} id - ID категории
     * @param {Object} data - Обновляемые данные
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Обновлённая категория
     */
    async updateCategory(id, data, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.put(`/api/categories/${id}`, data, config);
        return response.data;
    }

    /**
     * Удалить категорию (admin)
     * @param {string} id - ID категории
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Результат удаления
     */
    async deleteCategory(id, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.delete(`/api/categories/${id}`, config);
        return response.data;
    }
}

// Экспортируем singleton instance
export default new CategoriesService();