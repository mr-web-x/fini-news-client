"use server";

import contactService from "@/services/сontact.service";

/**
 * Отправить сообщение через контактную форму
 * @param {Object} formData - Данные формы
 * @param {string} formData.meno - Имя отправителя
 * @param {string} formData.email - Email отправителя
 * @param {string} formData.predmet - Тема сообщения
 * @param {string} formData.sprava - Текст сообщения
 * @returns {Promise<Object>} - Результат операции { success, message, data? }
 */
export async function sendContactMessage(formData) {
    try {
        console.log('[Server Action] sendContactMessage called with:', {
            meno: formData.meno,
            email: formData.email,
            predmet: formData.predmet
        });

        // Базовая валидация
        if (!formData.meno || !formData.email || !formData.predmet || !formData.sprava) {
            return {
                success: false,
                message: 'Všetky polia sú povinné'
            };
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return {
                success: false,
                message: 'Neplatný formát emailu'
            };
        }

        // Отправляем через сервис
        const result = await contactService.sendContactMessage(formData);

        console.log('[Server Action] Contact message sent successfully');

        return {
            success: true,
            message: 'Správa bola úspešne odoslaná!',
            data: result
        };
    } catch (error) {
        console.error('[Server Action] sendContactMessage error:', error);

        return {
            success: false,
            message: error.message || 'Chyba pri odosielaní správy. Skúste prosím neskôr.'
        };
    }
}