import api from '@/lib/serverApiClient';

/**
 * AdminUsersService - сервис для админской работы с пользователями
 * Все методы требуют admin прав
 */
class AdminUsersService {
    /**
     * Получить всех пользователей с фильтрами
     * @param {Object} params - Параметры фильтрации { page, limit, role, search, isBlocked }
     * @param {string} token - JWT токен
     * @returns {Promise<Object>} - Данные пользователей с пагинацией
     */
    async getAllUsers(params = {}, token) {
        const response = await api.get('/api/admin/users', {
            params,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }

    /**
     * Получить пользователя по ID
     * @param {string} id - ID пользователя
     * @param {string} token - JWT токен
     * @returns {Promise<Object>} - Данные пользователя
     */
    async getUserById(id, token) {
        const response = await api.get(`/api/admin/users/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }

    /**
     * Поиск пользователей
     * @param {Object} params - Параметры поиска { q, limit, role }
     * @param {string} token - JWT токен
     * @returns {Promise<Array>} - Результаты поиска
     */
    async searchUsers(params = {}, token) {
        const response = await api.get('/api/admin/users/search', {
            params,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }

    /**
     * Получить статистику пользователей
     * @param {string} token - JWT токен
     * @returns {Promise<Object>} - Статистика
     */
    async getUserStatistics(token) {
        const response = await api.get('/api/admin/users/stats', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }

    /**
     * Заблокировать пользователя
     * @param {string} id - ID пользователя
     * @param {Object} data - Данные блокировки { reason, until }
     * @param {string} token - JWT токен
     * @returns {Promise<Object>} - Результат блокировки
     */
    async blockUser(id, data, token) {
        const response = await api.post(`/api/admin/users/${id}/block`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }

    /**
     * Разблокировать пользователя
     * @param {string} id - ID пользователя
     * @param {string} token - JWT токен
     * @returns {Promise<Object>} - Результат разблокировки
     */
    async unblockUser(id, token) {
        const response = await api.post(`/api/admin/users/${id}/unblock`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }

    /**
     * Изменить роль пользователя
     * @param {string} id - ID пользователя
     * @param {Object} data - Данные роли { role }
     * @param {string} token - JWT токен
     * @returns {Promise<Object>} - Обновлённый пользователь
     */
    async changeUserRole(id, data, token) {
        const response = await api.put(`/api/admin/users/${id}/role`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }

    /**
     * Удалить пользователя (мягкое удаление)
     * @param {string} id - ID пользователя
     * @param {string} token - JWT токен
     * @returns {Promise<Object>} - Результат удаления
     */
    async deleteUser(id, token) {
        const response = await api.delete(`/api/admin/users/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    }
}

// Экспортируем singleton instance
export default new AdminUsersService();