import api from '@/lib/serverApiClient';

/**
 * AuthService - сервис для работы с авторизацией и пользователями
 * Все методы возвращают Promise с данными или ошибкой
 */
class AuthService {
    /**
     * Получить данные текущего пользователя
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Данные пользователя
     */
    async getCurrentUser(token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.get('/api/users/me', config);
        return response.data;
    }

    /**
     * Обновить профиль пользователя
     * @param {string} userId - ID пользователя
     * @param {Object} data - Данные для обновления
     * @param {string} token - JWT токен (для SSR)
     * @returns {Promise<Object>} - Обновлённые данные пользователя
     */
    async updateProfile(userId, data, token = null) {
        const config = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};

        const response = await api.put(`/api/users/profile/${userId}`, data, config);
        return response.data;
    }

    /**
     * Выход из системы
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            // Вызываем API route для очистки cookie
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    }

    /**
     * Обновить JWT токен
     * @returns {Promise<Object>} - Новый токен и данные пользователя
     */
    async refreshToken() {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка обновления токена:', error);
            throw error;
        }
    }
}

// Экспортируем singleton instance
export default new AuthService();