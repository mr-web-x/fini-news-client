import { getMe } from '@/actions/auth.actions';
import { getArticleById } from '@/actions/articles.actions';
import { redirect } from 'next/navigation';

/**
 * Умный редирект для статьи:
 * - published/pending → просмотр (/ukazka)
 * - draft/rejected → редактирование (/novy-clanok)
 * 
 * Route: /profil/moje-clanky/[moje-clankyId]
 * @param {Object} props
 * @param {Promise<Object>} props.params - параметры маршрута (async в Next.js 15)
 */
export default async function EditArticleRedirectPage({ params }) {
    // ✅ ИСПРАВЛЕНО: await params для Next.js 15
    const resolvedParams = await params;

    // SSR: Получаем данные пользователя на сервере
    const user = await getMe();

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    // Проверяем роль - только author и admin могут просматривать статьи
    if (user.role !== 'author' && user.role !== 'admin') {
        redirect('/profil');
    }

    // Получаем ID статьи из параметров
    const articleId = resolvedParams['moje-clankyId'];

    // Если нет ID - редирект на список статей
    if (!articleId) {
        redirect('/profil/moje-clanky');
    }

    // ✅ НОВОЕ: Получаем статью, чтобы проверить её статус
    const result = await getArticleById(articleId);

    // Если статья не найдена - редирект на список
    if (!result.success || !result.data) {
        redirect('/profil/moje-clanky');
    }

    const article = result.data;

    // ✅ КРИТИЧНО: Проверяем права доступа
    const authorId = article.author?.id || article.author;
    const userId = user.id;
    const isAuthor = String(authorId) === String(userId);
    const isAdmin = user.role === 'admin';

    // Если не автор и не админ - редирект
    if (!isAuthor && !isAdmin) {
        redirect('/profil/moje-clanky');
    }

    // ✅ УМНЫЙ РЕДИРЕКТ в зависимости от статуса статьи:
    if (article.status === 'published' || article.status === 'pending') {
        // Опубликованные и на модерации - только просмотр
        redirect(`/profil/moje-clanky/${articleId}/ukazka`);
    } else {
        // draft, rejected - можно редактировать
        redirect(`/profil/novy-clanok?id=${articleId}`);
    }
}