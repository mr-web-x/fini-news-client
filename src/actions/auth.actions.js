"use server";

import { cookies } from 'next/headers';
import authService from '@/services/auth.service';

/**
 * Получить JWT токен из cookies
 * @returns {string|null} - JWT токен или null
 */
async function getAuthToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    return token?.value || null;
}

/**
 * Получить данные текущего пользователя
 * @returns {Promise<Object|null>} - Данные пользователя или null
 */
export async function getMe() {
    try {
        const token = await getAuthToken();

        if (!token) {
            return null;
        }

        const user = await authService.getCurrentUser(token);
        return user;
    } catch (error) {
        console.error('[Server Action] getMe error:', error);
        return null;
    }
}

/**
 * Обновить профиль пользователя
 * @param {string} userId - ID пользователя
 * @param {Object} data - Данные для обновления
 * @returns {Promise<Object>} - Результат операции
 */
export async function updateProfile(userId, data) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Не авторизован'
            };
        }

        const updatedUser = await authService.updateProfile(userId, data, token);

        return {
            success: true,
            data: updatedUser
        };
    } catch (error) {
        console.error('[Server Action] updateProfile error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка обновления профиля'
        };
    }
}

/**
 * Выход из системы
 * @returns {Promise<Object>} - Результат операции
 */
export async function logout() {
    try {
        await authService.logout();

        return {
            success: true,
            message: 'Успешный выход'
        };
    } catch (error) {
        console.error('[Server Action] logout error:', error);
        return {
            success: false,
            message: error.message || 'Ошибка при выходе'
        };
    }
}

/**
 * Проверить авторизацию пользователя
 * @returns {Promise<boolean>} - true если авторизован
 */
export async function checkAuth() {
    try {
        const token = await getAuthToken();
        return !!token;
    } catch (error) {
        console.error('[Server Action] checkAuth error:', error);
        return false;
    }
}