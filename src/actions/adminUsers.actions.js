"use server";

import adminUsersService from '@/services/adminUsers.service';
import { cookies } from 'next/headers';

/**
 * Получить JWT токен из cookies
 * @returns {Promise<string|null>} - JWT токен или null
 */
async function getAuthToken() {
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
}

// ========================================
// ДЕЙСТВИЯ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ (admin)
// ========================================

/**
 * Получить всех пользователей с фильтрами (admin)
 * @param {Object} params - Параметры фильтрации
 * @returns {Promise<Object>} - Результат операции
 */
export async function getAllUsers(params = {}) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        const users = await adminUsersService.getAllUsers(params, token);

        return {
            success: true,
            data: users
        };
    } catch (error) {
        console.error('[Server Action] getAllUsers error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri načítavaní používateľov'
        };
    }
}

/**
 * Получить пользователя по ID (admin)
 * @param {string} id - ID пользователя
 * @returns {Promise<Object>} - Результат операции
 */
export async function getUserById(id) {
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
                message: 'ID používateľa nie je zadané'
            };
        }

        const user = await adminUsersService.getUserById(id, token);

        return {
            success: true,
            data: user
        };
    } catch (error) {
        console.error('[Server Action] getUserById error:', error);
        return {
            success: false,
            message: error.message || 'Používateľ nenájdený'
        };
    }
}

/**
 * Поиск пользователей (admin)
 * @param {Object} params - Параметры поиска { q, limit, role }
 * @returns {Promise<Object>} - Результат операции
 */
export async function searchUsers(params = {}) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        if (!params.q || params.q.trim().length < 2) {
            return {
                success: false,
                message: 'Vyhľadávací reťazec musí obsahovať minimálne 2 znaky'
            };
        }

        const users = await adminUsersService.searchUsers(params, token);

        return {
            success: true,
            data: users
        };
    } catch (error) {
        console.error('[Server Action] searchUsers error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri vyhľadávaní používateľov'
        };
    }
}

/**
 * Получить статистику пользователей (admin)
 * @returns {Promise<Object>} - Результат операции
 */
export async function getUserStatistics() {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        const stats = await adminUsersService.getUserStatistics(token);

        return {
            success: true,
            data: stats
        };
    } catch (error) {
        console.error('[Server Action] getUserStatistics error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri načítavaní štatistík'
        };
    }
}

/**
 * Заблокировать пользователя (admin)
 * @param {string} id - ID пользователя
 * @param {Object} data - Данные блокировки { reason, until? }
 * @returns {Promise<Object>} - Результат операции
 */
export async function blockUser(id, data) {
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
                message: 'ID používateľa nie je zadané'
            };
        }

        // Валидация
        if (!data.reason || data.reason.trim().length < 5) {
            return {
                success: false,
                message: 'Dôvod blokovania musí obsahovať minimálne 5 znakov'
            };
        }

        const result = await adminUsersService.blockUser(id, data, token);

        return {
            success: true,
            data: result,
            message: 'Používateľ bol úspešne zablokovaný'
        };
    } catch (error) {
        console.error('[Server Action] blockUser error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri blokovaní používateľa'
        };
    }
}

/**
 * Разблокировать пользователя (admin)
 * @param {string} id - ID пользователя
 * @returns {Promise<Object>} - Результат операции
 */
export async function unblockUser(id) {
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
                message: 'ID používateľa nie je zadané'
            };
        }

        const result = await adminUsersService.unblockUser(id, token);

        return {
            success: true,
            data: result,
            message: 'Používateľ bol úspešne odblokovaný'
        };
    } catch (error) {
        console.error('[Server Action] unblockUser error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri odblokovaní používateľa'
        };
    }
}

/**
 * Изменить роль пользователя (admin)
 * @param {string} id - ID пользователя
 * @param {Object} data - Данные роли { role }
 * @returns {Promise<Object>} - Результат операции
 */
export async function changeUserRole(id, data) {
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
                message: 'ID používateľa nie je zadané'
            };
        }

        // Валидация роли
        const allowedRoles = ['user', 'author'];
        if (!data.role || !allowedRoles.includes(data.role)) {
            return {
                success: false,
                message: 'Neplatná rola. Povolené hodnoty: user, author'
            };
        }

        const result = await adminUsersService.changeUserRole(id, data, token);

        return {
            success: true,
            data: result,
            message: `Rola používateľa bola úspešne zmenená na ${data.role}`
        };
    } catch (error) {
        console.error('[Server Action] changeUserRole error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri zmene roly používateľa'
        };
    }
}


/**
 * Удалить пользователя (admin)
 * @param {string} id - ID пользователя
 * @returns {Promise<Object>} - Результат операции
 */
export async function deleteUser(id) {
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
                message: 'ID používateľa nie je zadané'
            };
        }

        await adminUsersService.deleteUser(id, token);

        return {
            success: true,
            message: 'Používateľ bol úspešne vymazaný'
        };
    } catch (error) {
        console.error('[Server Action] deleteUser error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri mazaní používateľa'
        };
    }
}