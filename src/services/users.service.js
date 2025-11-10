// src/services/users.service.js
import api from '@/lib/serverApiClient';

/**
 * UsersService - сервис для работы с пользователями (публичные методы)
 */
class UsersService {
    /**
     * Получить всех авторов (публичный доступ)
     * @param {Object} filters - Фильтры { page, limit, search }
     * @returns {Promise<Object>} - Список авторов с пагинацией
     */
    async getAllAuthors(filters = {}) {
        const params = new URLSearchParams();

        // Пагинация
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        // Поиск
        if (filters.search) params.append('search', filters.search);

        console.log('📤 Fetching authors:', params.toString());

        const response = await api.get(`/api/users/authors?${params.toString()}`);
        return response.data;
    }

    /**
     * Получить автора по ID (публичный доступ)
     * @param {string} id - ID автора
     * @returns {Promise<Object>} - Данные автора
     */
    async getAuthorById(id) {
        const response = await api.get(`/api/users/authors/${id}`);
        return response.data;
    }
}

// Экспортируем singleton instance
export default new UsersService();