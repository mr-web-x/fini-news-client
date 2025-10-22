import axios from 'axios';

/**
 * Axios instance для работы с backend API
 * Автоматически добавляет JWT токен из cookies
 * Обрабатывает ошибки авторизации
 */
const serverApiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10001',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Отправляет cookies
});

/**
 * Request interceptor
 * Добавляет JWT токен из cookies (если есть)
 */
serverApiClient.interceptors.request.use(
    (config) => {
        // В серверных компонентах токен будет передаваться вручную
        // В клиентских - cookies отправятся автоматически через withCredentials
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor
 * Обрабатывает ошибки и форматирует ответы
 */
serverApiClient.interceptors.response.use(
    (response) => {
        // Возвращаем data из success ответа
        return response.data;
    },
    (error) => {
        // Обработка ошибок
        if (error.response) {
            // Сервер ответил с кодом ошибки
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - перенаправляем на логин
                    if (typeof window !== 'undefined') {
                        window.location.href = '/prihlasenie';
                    }
                    break;
                case 403:
                    // Forbidden - недостаточно прав
                    console.error('Недостаточно прав доступа');
                    break;
                case 404:
                    // Not Found
                    console.error('Ресурс не найден');
                    break;
                case 500:
                    // Internal Server Error
                    console.error('Ошибка сервера');
                    break;
                default:
                    console.error('Ошибка API:', data?.message || 'Неизвестная ошибка');
            }

            return Promise.reject(data || error);
        } else if (error.request) {
            // Запрос был отправлен, но ответа не было
            console.error('Нет ответа от сервера');
            return Promise.reject({ message: 'Нет ответа от сервера' });
        } else {
            // Ошибка при настройке запроса
            console.error('Ошибка запроса:', error.message);
            return Promise.reject({ message: error.message });
        }
    }
);

export default serverApiClient;