// ============================================
// src/utils/imageHelpers.js
// ============================================

/**
 * Валидация файла изображения
 * @param {File} file - Файл для валидации
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateImageFile = (file) => {
    if (!file) {
        return { valid: false, error: 'Súbor nebol vybraný' };
    }

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Neplatný formát súboru. Povolené sú len JPG, PNG a WEBP'
        };
    }

    // Проверка размера файла (максимум 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB в байтах
    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'Súbor je príliš veľký. Maximálna veľkosť je 5MB'
        };
    }

    return { valid: true, error: null };
};

/**
 * Получение полного URL изображения
 * @param {string} imageName - Имя файла изображения
 * @returns {string} - Полный URL или путь к placeholder
 */
export const getArticleImageUrl = (imageName) => {
    if (!imageName) {
        return '/images/placeholder.jpg';
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10001';
    return `${apiUrl}/uploads/articles/${imageName}`;
};

/**
 * Форматирование размера файла для отображения
 * @param {number} bytes - Размер в байтах
 * @returns {string} - Отформатированная строка (например, "2.5 MB")
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Создание preview URL из File объекта
 * @param {File} file - Файл изображения
 * @returns {string} - Data URL для preview
 */
export const createImagePreview = (file) => {
    return URL.createObjectURL(file);
};

/**
 * Очистка preview URL (освобождение памяти)
 * @param {string} url - URL созданный через createObjectURL
 */
export const revokeImagePreview = (url) => {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
};

/**
 * Получение расширения файла
 * @param {string} filename - Имя файла
 * @returns {string} - Расширение файла (например, "jpg")
 */
export const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
};

/**
 * Проверка является ли URL изображением
 * @param {string} url - URL для проверки
 * @returns {boolean}
 */
export const isImageUrl = (url) => {
    if (!url) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const extension = getFileExtension(url);
    return imageExtensions.includes(extension);
};