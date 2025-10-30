import { getMe } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';

/**
 * Редирект страница для редактирования статьи
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

    // Редирект на страницу редактирования с ID в query параметре
    // NewArticlePage уже умеет работать с query параметром ?id=...
    redirect(`/profil/novy-clanok?id=${articleId}`);
}