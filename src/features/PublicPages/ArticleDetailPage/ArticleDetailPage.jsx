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
    comments = [],
    user = null
}) => {
    const router = useRouter();

    // ✅ КРИТИЧЕСКАЯ ОТЛАДОЧНАЯ ИНФОРМАЦИЯ
    console.log('🔍 ArticleDetailPage - Full Author Object:', {
        article_id: article._id,
        author_full: article.author,
        author_id: article.author?._id,
        author_bio: article.author?.bio,
        bio_type: typeof article.author?.bio,
        bio_length: article.author?.bio?.length,
        bio_truthy: !!article.author?.bio,
        firstName: article.author?.firstName,
        lastName: article.author?.lastName,
        position: article.author?.position
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
        const text = content.replace(/<[^>]*>/g, '');
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return minutes > 0 ? minutes : 1;
    }

    const readTime = article.readTime || calculateReadTime(article.content);
    const authorFullName = article.author
        ? `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim()
        : 'Autor';

    const handleCommentAdded = () => {
        router.refresh();
    };

    const handleCommentUpdated = () => {
        router.refresh();
    };

    const handleCommentDeleted = () => {
        router.refresh();
    };

    return (
        <div className="article-detail-page">
            <div className="container">
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
                    <article className="article-detail__main">
                        {article.category && (
                            <Link
                                href={`/spravy?category=${article.category.slug}`}
                                className="article-detail__category"
                            >
                                {article.category.name}
                            </Link>
                        )}

                        <h1 className="article-detail__title">{article.title}</h1>

                        <div className="article-detail__meta">
                            {article.author && (
                                <Link
                                    href={`/autori/${article.author._id}`}
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

                            <span className="article-detail__date">
                                {formatDate(article.publishedAt || article.createdAt)}
                            </span>

                            <span className="article-detail__read-time">
                                📖 {readTime} min čítania
                            </span>

                            <span className="article-detail__views">
                                👁️ {article.views || 0} zobrazení
                            </span>
                        </div>

                        {article.coverImage && (
                            <div className="article-detail__image">
                                <div className="article-detail__image-placeholder">
                                    📷 Cover Image
                                </div>
                            </div>
                        )}

                        {article.excerpt && (
                            <div className="article-detail__excerpt">
                                {article.excerpt}
                            </div>
                        )}

                        {article.content && (
                            <div
                                className="article-detail__content"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        )}

                        {article.tags && article.tags.length > 0 && (
                            <div className="article-detail__tags">
                                {article.tags.map((tag, index) => (
                                    <span key={index} className="article-detail__tag">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* ✅ ВРЕМЕННЫЙ ОТЛАДОЧНЫЙ БЛОК - ПОКАЖЕТ ЧТО РЕАЛЬНО ПРИХОДИТ */}
                        <div style={{
                            background: '#fff3cd',
                            border: '2px solid #ffc107',
                            padding: '20px',
                            margin: '30px 0',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            fontSize: '14px'
                        }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#856404' }}>
                                🔍 DEBUG: Author Bio Information
                            </h3>
                            <div><strong>Author ID:</strong> {article.author?._id || 'N/A'}</div>
                            <div><strong>Full Name:</strong> {authorFullName}</div>
                            <div><strong>Position:</strong> {article.author?.position || 'EMPTY'}</div>
                            <div><strong>Bio exists:</strong> {article.author?.bio ? 'YES ✅' : 'NO ❌'}</div>
                            <div><strong>Bio type:</strong> {typeof article.author?.bio}</div>
                            <div><strong>Bio length:</strong> {article.author?.bio?.length || 0}</div>
                            <div style={{ marginTop: '10px', padding: '10px', background: 'white', borderRadius: '4px' }}>
                                <strong>Bio content:</strong><br />
                                "{article.author?.bio || 'COMPLETELY EMPTY'}"
                            </div>
                        </div>

                        {article.author && (
                            <div className="article-author-bio">
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
                                <div className="article-author-bio__content">
                                    <h3 className="article-author-bio__name">
                                        {authorFullName}
                                    </h3>
                                    {article.author.position && (
                                        <p className="article-author-bio__position">
                                            {article.author.position}
                                        </p>
                                    )}
                                    {/* ✅ УПРОЩЕННАЯ ЛОГИКА */}
                                    <p className="article-author-bio__text">
                                        {article.author.bio || "Autor tohto článku."}
                                    </p>
                                    <Link
                                        href={`/autori/${article.author._id}`}
                                        className="article-author-bio__link"
                                    >
                                        Všetky články autora →
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div className="article-detail__share">
                            <h3 className="article-detail__share-title">Zdieľať článok</h3>
                            <div className="article-detail__share-buttons">
                                <button className="share-button share-button--facebook">
                                    Facebook
                                </button>
                                <button className="share-button share-button--twitter">
                                    Twitter
                                </button>
                                <button className="share-button share-button--linkedin">
                                    LinkedIn
                                </button>
                                <button className="share-button share-button--copy">
                                    Kopírovať odkaz
                                </button>
                            </div>
                        </div>

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

                        <div className="article-detail__ad">
                            <p className="article-detail__ad-label">Reklama</p>
                            <div className="article-detail__ad-content">
                                <p>Reklamný priestor</p>
                            </div>
                        </div>
                    </article>

                    <section className="article-detail__comments">
                        <h2 className="article-detail__comments-title">
                            Komentáre
                        </h2>

                        {user && (
                            <CommentForm
                                articleId={article._id}
                                user={user}
                                onCommentAdded={handleCommentAdded}
                            />
                        )}

                        <CommentsList
                            comments={comments}
                            user={user}
                            onCommentUpdated={handleCommentUpdated}
                            onCommentDeleted={handleCommentDeleted}
                        />

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
        </div>
    )
}

export default ArticleDetailPage