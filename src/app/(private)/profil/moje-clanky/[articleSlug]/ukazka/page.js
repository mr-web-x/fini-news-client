import { getMe } from '@/actions/auth.actions';
import { getArticleBySlug } from '@/actions/articles.actions';
import { redirect } from 'next/navigation';
import ArticlePreviewPage from '@/features/ArticlePreviewPage/ArticlePreviewPage';

/**
 * ========================================
 * ОБНОВЛЕННАЯ СТРАНИЦА ПРЕДПРОСМОТРА
 * ========================================
 * 
 * Route: /profil/moje-clanky/[articleSlug]/ukazka
 * 
 * ИЗМЕНЕНИЯ:
 * 1. Параметр изменён с [moje-clankyId] на [articleSlug]
 * 2. Используется getArticleBySlug() вместо getArticleById()
 * 3. В редиректах используется article.slug
 * 4. URL: /profil/moje-clanky/nova-sprava-o-financiach/ukazka
 * 
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

    // ✅ ИЗМЕНЕНО: Получаем SLUG статьи из параметров вместо ID
    const articleSlug = resolvedParams['articleSlug'];

    // Если нет slug - редирект на список статей
    if (!articleSlug) {
        redirect('/profil/moje-clanky');
    }

    // ✅ ИЗМЕНЕНО: Получаем статью по SLUG вместо ID
    const result = await getArticleBySlug(articleSlug);

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
        // ✅ ИЗМЕНЕНО: Используем article.slug в редиректе
        redirect(`/profil/moje-clanky/${article.slug}`);
    }

    // ✅ Для draft, rejected, pending - показываем предпросмотр без комментариев
    // ArticlePreviewPage сам проверит права доступа:
    // - Author может просматривать только СВОИ статьи
    // - Admin может просматривать любые статьи
    // ⚠️ ВАЖНО: Передаём articleId (не slug!) в ArticlePreviewPage
    // потому что компонент использует ID для API запросов
    return <ArticlePreviewPage user={user} articleId={article._id} />;
}