import api from '@/lib/serverApiClient';

/**
 * ContactService - сервис для работы с контактной формой
 * Отправляет сообщения через backend Telegram сервис
 */
class ContactService {
    /**
     * Отправить сообщение через контактную форму
     * @param {Object} formData - Данные формы
     * @param {string} formData.meno - Имя отправителя
     * @param {string} formData.email - Email отправителя
     * @param {string} formData.predmet - Тема сообщения
     * @param {string} formData.sprava - Текст сообщения
     * @returns {Promise<Object>} - Результат отправки
     */
    async sendContactMessage(formData) {
        try {
            const { meno, email, predmet, sprava } = formData;

            // Валидация данных
            if (!meno || !email || !predmet || !sprava) {
                throw new Error('Všetky polia sú povinné');
            }

            // Формируем сообщение для Telegram
            const message = this._formatTelegramMessage(formData);

            console.log('📤 Sending contact form to backend:', { meno, email, predmet });

            // Отправляем на backend
            const response = await api.post('/api/telegram/send', {
                message
            });

            console.log('✅ Contact message sent successfully:', response);

            return response;
        } catch (error) {
            console.error('❌ Error sending contact message:', error);

            // Обработка ошибок
            const errorMessage = error.message || 'Chyba pri odosielaní správy';

            throw new Error(errorMessage);
        }
    }

    /**
     * Форматировать данные формы в сообщение для Telegram
     * @param {Object} formData - Данные формы
     * @returns {string} - Отформатированное сообщение
     * @private
     */
    _formatTelegramMessage(formData) {
        const { meno, email, predmet, sprava } = formData;

        return `📧 Nová správa z kontaktného formulára

👤 Meno: ${meno}
📧 Email: ${email}
📝 Predmet: ${predmet}

💬 Správa:
${sprava}`;
    }
}

// Создаём и экспортируем экземпляр сервиса
const contactService = new ContactService();

export default contactService;