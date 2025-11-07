import { getMe } from '@/actions/auth.actions';
import { getArticleBySlug } from '@/actions/articles.actions';
import { redirect } from 'next/navigation';
import ArticleViewPage from '@/features/ArticleViewPage/ArticleViewPage';

/**
 * ========================================
 * НОВАЯ СТРАНИЦА ПРОСМОТРА СТАТЬИ
 * ========================================
 * 
 * Route: /profil/moje-clanky/[articleSlug]
 * 
 * ИЗМЕНЕНИЯ:
 * 1. Параметр маршрута изменён с [moje-clankyId] на [articleSlug]
 * 2. Используется getArticleBySlug() вместо getArticleById()
 * 3. URL теперь выглядит так: /profil/moje-clanky/nova-sprava-o-financiach
 * 
 * @param {Object} props
 * @param {Promise<Object>} props.params - параметры маршрута (async в Next.js 15)
 */
export default async function MojeClankyDetailPage({ params }) {
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

    // ✅ НОВАЯ ЛОГИКА: Разрешаем просмотр только для published статей
    // Для других статусов - редирект на соответствующие страницы
    if (article.status === 'draft' || article.status === 'rejected') {
        // ✅ ИЗМЕНЕНО: Используем slug в редиректе
        // Черновики и отклонённые - редирект на редактирование
        redirect(`/profil/moje-clanky/${articleSlug}/upravit`);
    }

    if (article.status === 'pending') {
        // ✅ ИЗМЕНЕНО: Используем slug в редиректе
        // На модерации - редирект на предпросмотр
        redirect(`/profil/moje-clanky/${articleSlug}/ukazka`);
    }

    // ✅ Для published статей - показываем ArticleViewPage с комментариями
    return <ArticleViewPage article={article} user={user} />;
}