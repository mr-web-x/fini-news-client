"use server";

import categoriesService from '@/services/categories.service';
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
// ПУБЛИЧНЫЕ ДЕЙСТВИЯ
// ========================================

/**
 * Получить все категории (публичный доступ)
 * @returns {Promise<Object>} - Результат операции
 */
export async function getAllCategories() {
    try {
        const categories = await categoriesService.getAllCategories();

        return {
            success: true,
            data: categories
        };
    } catch (error) {
        console.error('[Server Action] getAllCategories error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri načítavaní kategórií'
        };
    }
}

/**
 * Получить категорию по ID (публичный доступ)
 * @param {string} id - ID категории
 * @returns {Promise<Object>} - Результат операции
 */
export async function getCategoryById(id) {
    try {
        if (!id) {
            return {
                success: false,
                message: 'ID kategórie nie je zadané'
            };
        }

        const category = await categoriesService.getCategoryById(id);

        return {
            success: true,
            data: category
        };
    } catch (error) {
        console.error('[Server Action] getCategoryById error:', error);
        return {
            success: false,
            message: error.message || 'Kategória nenájdená'
        };
    }
}

/**
 * Получить категорию по slug (публичный доступ)
 * @param {string} slug - Slug категории
 * @returns {Promise<Object>} - Результат операции
 */
export async function getCategoryBySlug(slug) {
    try {
        if (!slug) {
            return {
                success: false,
                message: 'Slug kategórie nie je zadaný'
            };
        }

        const category = await categoriesService.getCategoryBySlug(slug);

        return {
            success: true,
            data: category
        };
    } catch (error) {
        console.error('[Server Action] getCategoryBySlug error:', error);
        return {
            success: false,
            message: error.message || 'Kategória nenájdená'
        };
    }
}

// ========================================
// ПРИВАТНЫЕ ДЕЙСТВИЯ (admin)
// ========================================

/**
 * Создать новую категорию (admin)
 * @param {Object} data - Данные категории { name, slug?, description? }
 * @returns {Promise<Object>} - Результат операции
 */
export async function createCategory(data) {
    try {
        const token = await getAuthToken();

        if (!token) {
            return {
                success: false,
                message: 'Nie ste prihlásený'
            };
        }

        // Валидация
        if (!data.name || data.name.trim().length < 2) {
            return {
                success: false,
                message: 'Názov kategórie musí obsahovať minimálne 2 znaky'
            };
        }

        // Если slug не передан, генерируем автоматически из name
        const categoryData = {
            name: data.name.trim(),
            slug: data.slug || generateSlug(data.name),
            description: data.description?.trim() || ''
        };

        const category = await categoriesService.createCategory(categoryData, token);

        return {
            success: true,
            data: category,
            message: 'Kategória bola úspešne vytvorená'
        };
    } catch (error) {
        console.error('[Server Action] createCategory error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri vytváraní kategórie'
        };
    }
}

/**
 * Обновить категорию (admin)
 * @param {string} id - ID категории
 * @param {Object} data - Обновляемые данные
 * @returns {Promise<Object>} - Результат операции
 */
export async function updateCategory(id, data) {
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
                message: 'ID kategórie nie je zadané'
            };
        }

        // Валидация
        if (data.name && data.name.trim().length < 2) {
            return {
                success: false,
                message: 'Názov kategórie musí obsahovať minimálne 2 znaky'
            };
        }

        const category = await categoriesService.updateCategory(id, data, token);

        return {
            success: true,
            data: category,
            message: 'Kategória bola úspešne aktualizovaná'
        };
    } catch (error) {
        console.error('[Server Action] updateCategory error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri aktualizácii kategórie'
        };
    }
}

/**
 * Удалить категорию (admin)
 * @param {string} id - ID категории
 * @returns {Promise<Object>} - Результат операции
 */
export async function deleteCategory(id) {
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
                message: 'ID kategórie nie je zadané'
            };
        }

        await categoriesService.deleteCategory(id, token);

        return {
            success: true,
            message: 'Kategória bola úspešne vymazaná'
        };
    } catch (error) {
        console.error('[Server Action] deleteCategory error:', error);
        return {
            success: false,
            message: error.message || 'Chyba pri mazaní kategórie'
        };
    }
}

// ========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ========================================

/**
 * Генерация slug из текста
 * @param {string} text - Исходный текст
 * @returns {string} - Slug
 */
function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // удаляем диакритические знаки
        .replace(/[^\w\s-]/g, '') // удаляем специальные символы
        .replace(/\s+/g, '-') // пробелы в дефисы
        .replace(/-+/g, '-') // множественные дефисы в один
        .trim();
}