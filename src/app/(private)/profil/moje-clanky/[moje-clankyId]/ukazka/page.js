import { getMe } from '@/actions/auth.actions';
import { getArticleById } from '@/actions/articles.actions';
import { redirect } from 'next/navigation';
import ArticlePreviewPage from '@/features/ArticlePreviewPage/ArticlePreviewPage';

/**
 * Серверная страница предпросмотра статьи
 * Route: /profil/moje-clanky/[moje-clankyId]/ukazka
 * @param {Object} props
 * @param {Promise<Object>} props.params - параметры маршрута (async в Next.js 15)
 */
export default async function UkazkaPage({ params }) {
    // ✅ ИСПРАВЛЕНО: await params для Next.js 15
    const resolvedParams = await params;

    // SSR: Получаем данные пользователя на сервере
    const user = await getMe();

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        redirect('/prihlasenie');
    }

    // ✅ ИСПРАВЛЕНО: Проверяем роль - доступ для author и admin
    if (user.role !== 'author' && user.role !== 'admin') {
        redirect('/profil');
    }

    // Получаем ID статьи из динамического параметра
    const articleId = resolvedParams['moje-clankyId'];

    // Если нет ID - редирект на список статей
    if (!articleId) {
        redirect('/profil/moje-clanky');
    }

    // ✅ НОВОЕ: Получаем статью для проверки статуса
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

    // ✅ НОВАЯ ЛОГИКА: Для опубликованных статей - редирект на полный просмотр
    if (article.status === 'published') {
        redirect(`/profil/moje-clanky/${articleId}`);
    }

    // ✅ Для draft, rejected, pending - показываем предпросмотр без комментариев
    // ArticlePreviewPage сам проверит права доступа:
    // - Author может просматривать только СВОИ статьи
    // - Admin может просматривать любые статьи
    return <ArticlePreviewPage user={user} articleId={articleId} />;
}