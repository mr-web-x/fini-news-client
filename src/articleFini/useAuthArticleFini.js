import { create } from 'zustand';

/**
 * Zustand store для управления авторизацией
 * Хранит данные пользователя и статус авторизации
 */
const useAuthStore = create((set) => ({
    // Состояние
    user: null,
    isAuthenticated: false,
    isLoading: true,

    // Действия
    /**
     * Установить данные пользователя
     * @param {Object} user - Данные пользователя
     */
    setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false
    }),

    /**
     * Очистить данные пользователя (выход)
     */
    clearUser: () => set({
        user: null,
        isAuthenticated: false,
        isLoading: false
    }),

    /**
     * Установить статус загрузки
     * @param {boolean} isLoading
     */
    setLoading: (isLoading) => set({ isLoading }),

    /**
     * Проверить роль пользователя
     * @param {string} role - Роль для проверки ('user', 'author', 'admin')
     * @returns {boolean}
     */
    hasRole: (role) => {
        const state = useAuthStore.getState();
        if (!state.user) return false;

        const userRole = state.user.role;

        // Иерархия ролей: admin > author > user
        if (role === 'user') return ['user', 'author', 'admin'].includes(userRole);
        if (role === 'author') return ['author', 'admin'].includes(userRole);
        if (role === 'admin') return userRole === 'admin';

        return false;
    }
}));

export default useAuthStore;