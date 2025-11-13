"use client";

import { useRouter } from "next/navigation";
import "./ArticleDetailPage.scss"
import Link from "next/link"
import CommentsList from "@/components/CommentsList/CommentsList"
import CommentForm from "@/components/CommentForm/CommentForm"
import NewsCard from "@/components/NewsCard/NewsCard"

const ArticleDetailPage = ({
    article,
    relatedArticles = [],
    comments = [], // ✅ Комментарии из props
    user = null
}) => {
    const router = useRouter();

    console.log('🔍 ArticleDetailPage DEBUG:', {
        articleAuthor: article.author,
        hasAuthor: !!article.author,
        authorSlug: article.author?.slug, // ✅ НОВОЕ: Логируем slug
        authorBio: article.author?.bio,
        bioLength: article.author?.bio?.length,
        bioType: typeof article.author?.bio,
        authorFirstName: article.author?.firstName,
        authorLastName: article.author?.lastName
    });

    // Форматирование даты
    const formatDate = (isoDate) => {
        if (!isoDate) return ""
        const date = new Date(isoDate)
        const day = String(date.getDate()).padStart(2, "0")
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const year = date.getFullYear()
        return `${day}.${month}.${year}`
    }

    // Вычисление времени чтения на основе контента
    const calculateReadTime = (content) => {
        if (!content) return 5;

        // Убираем HTML теги
        const text = content.replace(/<[^>]*>/g, '');
        // Считаем слова
        const words = text.trim().split(/\s+/).length;
        // Средняя скорость чтения: 200 слов в минуту
        const minutes = Math.ceil(words / 200);

        return minutes > 0 ? minutes : 1;
    }

    // Получаем время чтения
    const readTime = article.readTime || calculateReadTime(article.content);

    // Получаем полное имя автора
    const authorFullName = article.author
        ? `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim()
        : 'Autor';

    // ✅ НОВОЕ: URL автора (slug или fallback на ID)
    const authorUrl = article.author?.slug || article.author?.id || '#';

    // ✅ Callback при добавлении комментария - перезагружаем страницу
    const handleCommentAdded = () => {
        router.refresh(); // Перезагружает серверный компонент (page.js)
    };

    // ✅ Callback при обновлении комментария
    const handleCommentUpdated = () => {
        router.refresh();
    };

    // ✅ Callback при удалении комментария
    const handleCommentDeleted = () => {
        router.refresh();
    };



    return (
        <main className="article-detail-page">
            <div className="container">
                {/* Breadcrumbs */}
                <nav className="breadcrumbs">
                    <Link href="/">Domov</Link>
                    <span>/</span>
                    <Link href="/spravy">Správy</Link>
                    <span>/</span>
                    {article.category && (
                        <>
                            <Link href={`/spravy?category=${article.category.slug}`}>
                                {article.category.name}
                            </Link>
                            <span>/</span>
                        </>
                    )}
                    <span className="breadcrumbs__current">{article.title}</span>
                </nav>

                <div className="article-detail">
                    {/* Основной контент */}
                    <article className="article-detail__main">
                        {/* Категория */}
                        {article.category && (
                            <Link
                                href={`/spravy?category=${article.category.slug}`}
                                className="article-detail__category"
                            >
                                {article.category.name}
                            </Link>
                        )}

                        {/* Заголовок */}
                        <h1 className="article-detail__title">{article.title}</h1>

                        {/* Мета-информация */}
                        <div className="article-detail__meta">
                            {/* Автор */}
                            {article.author && (
                                <Link
                                    href={`/autori/${authorUrl}`}
                                    className="article-detail__author"
                                >
                                    {article.author.avatar ? (
                                        <img
                                            src={article.author.avatar}
                                            alt={authorFullName}
                                            className="article-detail__author-avatar"
                                        />
                                    ) : (
                                        <div className="article-detail__author-avatar-placeholder">
                                            {article.author.firstName?.[0] || '?'}{article.author.lastName?.[0] || ''}
                                        </div>
                                    )}
                                    <span className="article-detail__author-name">
                                        {authorFullName}
                                    </span>
                                </Link>
                            )}

                            {/* Дата публикации */}
                            <span className="article-detail__date">
                                {formatDate(article.publishedAt || article.createdAt)}
                            </span>

                            {/* Время чтения */}
                            <span className="article-detail__read-time">
                                📖 {readTime} min čítania
                            </span>

                            {/* Просмотры */}
                            <span className="article-detail__views">
                                👁️ {article.views || 0} zobrazení
                            </span>
                        </div>

                        {/* Изображение - пока заглушка */}
                        {article.coverImage && (
                            <div className="article-detail__image">
                                <div className="article-detail__image-placeholder">
                                    📷 Cover Image
                                </div>
                            </div>
                        )}

                        {/* Краткое описание */}
                        {article.excerpt && (
                            <div className="article-detail__excerpt">
                                {article.excerpt}
                            </div>
                        )}

                        {/* Контент статьи */}
                        {article.content && (
                            <div
                                className="article-detail__content"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        )}

                        {/* Теги */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="article-detail__tags">
                                {article.tags.map((tag, index) => (
                                    <span key={index} className="article-detail__tag">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Информация об авторе (врезка) */}
                        {article.author && (
                            <div className="article-author-bio">
                                <Link
                                    href={`/autori/${authorUrl}`}
                                    className="article-author-bio__avatar-link"
                                >
                                    {article.author.avatar ? (
                                        <img
                                            src={article.author.avatar}
                                            alt={authorFullName}
                                            className="article-author-bio__avatar"
                                        />
                                    ) : (
                                        <div className="article-author-bio__avatar-placeholder">
                                            {article.author.firstName?.[0] || '?'}{article.author.lastName?.[0] || ''}
                                        </div>
                                    )}
                                </Link>

                                <div className="article-author-bio__content">
                                    <Link
                                        href={`/autori/${authorUrl}`}
                                        className="article-author-bio__name-link"
                                    >
                                        <h3 className="article-author-bio__name">{authorFullName}</h3>
                                    </Link>

                                    {article.author.position && (
                                        <p className="article-author-bio__position">{article.author.position}</p>
                                    )}

                                    {article.author.bio && (
                                        <p className="article-author-bio__bio">{article.author.bio}</p>
                                    )}

                                    <Link
                                        href={`/autori/${authorUrl}`}
                                        className="article-author-bio__link"
                                    >
                                        Všetky články autora →
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Кнопки действий */}
                        <div className="article-detail__actions">
                            <button className="article-detail__action article-detail__action--share">
                                🔗 Zdieľať
                            </button>
                            <button className="article-detail__action article-detail__action--bookmark">
                                🔖 Uložiť
                            </button>
                            <button className="article-detail__action article-detail__action--copy">
                                📋 Kopírovať odkaz
                            </button>
                        </div>

                        {/* Похожие статьи */}
                        {relatedArticles.length > 0 && (
                            <div className="related-articles">
                                <h2 className="related-articles__title">Podobné články</h2>
                                <div className="related-articles__grid">
                                    {relatedArticles.slice(0, 6).map((relatedArticle) => (
                                        <NewsCard
                                            key={relatedArticle._id}
                                            article={relatedArticle}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Рекламный блок */}
                        <div className="article-detail__ad">
                            <p className="article-detail__ad-label">Reklama</p>
                            <div className="article-detail__ad-content">
                                <p>Reklamný priestor</p>
                            </div>
                        </div>
                    </article>

                    {/* Комментарии */}
                    <section className="article-detail__comments">
                        <h2 className="article-detail__comments-title">
                            Komentáre
                        </h2>

                        {/* Форма для авторизованных */}
                        {user && (
                            <CommentForm
                                articleId={article._id}
                                user={user}
                                onCommentAdded={handleCommentAdded}
                            />
                        )}

                        {/* Список комментариев */}
                        <CommentsList
                            comments={comments} // ✅ Передаём комментарии из props
                            user={user}
                            onCommentUpdated={handleCommentUpdated}
                            onCommentDeleted={handleCommentDeleted}
                        />

                        {/* Сообщение для неавторизованных */}
                        {!user && (
                            <div className="article-detail__login-prompt">
                                <p>Prihláste sa, aby ste mohli pridať komentár</p>
                                <Link href="/prihlasenie" className="article-detail__login-button">
                                    Prihlásiť sa
                                </Link>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    )
}

export default ArticleDetailPage