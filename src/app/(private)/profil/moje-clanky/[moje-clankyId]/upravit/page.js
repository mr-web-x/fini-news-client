import { getMe } from '@/actions/auth.actions';
import { getArticleById } from '@/actions/articles.actions';
import { redirect } from 'next/navigation';
import NewArticlePage from '@/features/NewArticlePage/NewArticlePage';

/**
 * Страница редактирования статьи
 * Route: /profil/moje-clanky/[moje-clankyId]/upravit
 * @param {Object} props
 * @param {Promise<Object>} props.params - параметры маршрута (async в Next.js 15)
 */
export default async function UpravitArticlePage({ params }) {
    // ✅ ИСПРАВЛЕНО: await params для Next.js 15
    const resolvedParams = await params;

    // SSR: Получаем данные пользователя на сервере
    const user = await getMe();

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    // Проверяем роль - только author и admin могут редактировать статьи
    if (user.role !== 'author' && user.role !== 'admin') {
        redirect('/profil');
    }

    // Получаем ID статьи из параметров
    const articleId = resolvedParams['moje-clankyId'];

    // Если нет ID - редирект на список статей
    if (!articleId) {
        redirect('/profil/moje-clanky');
    }

    // Получаем статью по ID
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

    // ✅ НОВАЯ ЛОГИКА: Разрешаем редактирование только для draft и rejected
    if (article.status === 'published') {
        // Опубликованные статьи - редирект на просмотр
        redirect(`/profil/moje-clanky/${articleId}`);
    }

    if (article.status === 'pending') {
        // На модерации - редирект на предпросмотр
        redirect(`/profil/moje-clanky/${articleId}/ukazka`);
    }

    // ✅ Для draft и rejected - показываем форму редактирования
    // Передаём articleId через пропсы в NewArticlePage
    return <NewArticlePage user={user} articleId={articleId} />;
}