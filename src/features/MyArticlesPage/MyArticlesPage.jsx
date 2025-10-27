"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMyArticles, deleteArticle, submitArticleForReview } from "@/actions/articles.actions";
import "./MyArticlesPage.scss";

const MyArticlesPage = ({ user }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, draft, pending, published, rejected
    const [stats, setStats] = useState({
        total: 0,
        draft: 0,
        pending: 0,
        published: 0,
        rejected: 0,
        totalViews: 0
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    // ✅ Загружаем статистику ОДИН РАЗ при монтировании
    useEffect(() => {
        loadAllStats();
    }, []);

    // ✅ Загружаем статьи при изменении фильтра
    useEffect(() => {
        loadUserArticles();
    }, [filter]);

    /**
     * Загрузка ОБЩЕЙ статистики по всем статьям пользователя
     * Вызывается ОДИН РАЗ при монтировании
     */
    const loadAllStats = async () => {
        setStatsLoading(true);

        try {
            // Загружаем ВСЕ статьи пользователя для подсчета статистики
            const result = await getMyArticles('all');

            if (result.success) {
                const allArticles = result.data.articles || result.data || [];

                const totalViews = allArticles.reduce((sum, article) => sum + (article.views || 0), 0);

                setStats({
                    total: allArticles.length,
                    draft: allArticles.filter(a => a.status === 'draft').length,
                    pending: allArticles.filter(a => a.status === 'pending').length,
                    published: allArticles.filter(a => a.status === 'published').length,
                    rejected: allArticles.filter(a => a.status === 'rejected').length,
                    totalViews
                });
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    /**
     * Загрузка статей по текущему фильтру
     */
    const loadUserArticles = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Получаем статьи текущего пользователя через Server Action
            const result = await getMyArticles(filter);

            if (!result.success) {
                setMessage({ type: 'error', text: result.message });
                setArticles([]);
                setLoading(false);
                return;
            }

            const articlesData = result.data.articles || result.data || [];
            setArticles(articlesData);

        } catch (error) {
            console.error('Error loading articles:', error);
            setMessage({ type: 'error', text: 'Chyba pri načítavaní článkov' });
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'draft': return 'Koncept';
            case 'pending': return 'Na moderácii';
            case 'published': return 'Publikované';
            case 'rejected': return 'Zamietnuté';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'status--draft';
            case 'pending': return 'status--pending';
            case 'published': return 'status--published';
            case 'rejected': return 'status--rejected';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('sk-SK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDelete = async (articleId) => {
        if (!confirm('Naozaj chcete vymazať tento článok?')) return;

        try {
            const result = await deleteArticle(articleId);

            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                loadUserArticles(); // Перезагружаем список
                loadAllStats(); // Обновляем статистику
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            setMessage({ type: 'error', text: 'Chyba pri mazaní článku' });
        }
    };

    const handleSubmitForReview = async (articleId) => {
        if (!confirm('Odoslať článok na moderáciu?')) return;

        try {
            const result = await submitArticleForReview(articleId);

            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                loadUserArticles(); // Перезагружаем список
                loadAllStats(); // Обновляем статистику
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            console.error('Error submitting article:', error);
            setMessage({ type: 'error', text: 'Chyba pri odosielaní článku' });
        }
    };

    return (
        <div className="my-articles-page">
            <div className="articles__header">
                <div className="articles__header-content">
                    <h1>Moje články</h1>
                    <p>Spravujte svoje články a ich stavy</p>
                </div>
                <Link href="/profil/novy-clanok" className="articles__new-btn">
                    ➕ Nový článok
                </Link>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`articles__message articles__message--${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Statistics */}
            <div className="articles__stats">
                <div className="articles__stat-card">
                    <div className="articles__stat-number">
                        {statsLoading ? '...' : stats.total}
                    </div>
                    <div className="articles__stat-label">Celkovo článkov</div>
                </div>
                <div className="articles__stat-card">
                    <div className="articles__stat-number">
                        {statsLoading ? '...' : stats.published}
                    </div>
                    <div className="articles__stat-label">Publikované</div>
                </div>
                <div className="articles__stat-card">
                    <div className="articles__stat-number">
                        {statsLoading ? '...' : stats.pending}
                    </div>
                    <div className="articles__stat-label">Na moderácii</div>
                </div>
                <div className="articles__stat-card">
                    <div className="articles__stat-number">
                        {statsLoading ? '...' : stats.totalViews}
                    </div>
                    <div className="articles__stat-label">Celkové zobrazenia</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="articles__filters">
                <button
                    onClick={() => setFilter('all')}
                    className={`articles__filter-btn ${filter === 'all' ? 'articles__filter-btn--active' : ''}`}
                >
                    Všetky ({statsLoading ? '...' : stats.total})
                </button>
                <button
                    onClick={() => setFilter('published')}
                    className={`articles__filter-btn ${filter === 'published' ? 'articles__filter-btn--active' : ''}`}
                >
                    Publikované ({statsLoading ? '...' : stats.published})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`articles__filter-btn ${filter === 'pending' ? 'articles__filter-btn--active' : ''}`}
                >
                    Na moderácii ({statsLoading ? '...' : stats.pending})
                </button>
                <button
                    onClick={() => setFilter('draft')}
                    className={`articles__filter-btn ${filter === 'draft' ? 'articles__filter-btn--active' : ''}`}
                >
                    Koncepty ({statsLoading ? '...' : stats.draft})
                </button>
                <button
                    onClick={() => setFilter('rejected')}
                    className={`articles__filter-btn ${filter === 'rejected' ? 'articles__filter-btn--active' : ''}`}
                >
                    Zamietnuté ({statsLoading ? '...' : stats.rejected})
                </button>
            </div>

            {/* Articles List */}
            <div className="articles__list">
                {loading ? (
                    <div className="articles__loading">
                        <div className="spinner"></div>
                        <p>Načítavam články...</p>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="articles__empty">
                        <div className="articles__empty-icon">📝</div>
                        <h3>Žiadne články</h3>
                        <p>Zatiaľ ste nevytvorili žiadne články v tejto kategórii.</p>
                        <Link href="/profil/novy-clanok" className="articles__empty-btn">
                            Vytvoriť prvý článok
                        </Link>
                    </div>
                ) : (
                    articles.map(article => (
                        <div key={article._id} className="article-card">
                            <div className="article-card__header">
                                <span className={`article-card__status ${getStatusColor(article.status)}`}>
                                    {getStatusLabel(article.status)}
                                </span>
                                <span className="article-card__date">
                                    {formatDate(article.createdAt)}
                                </span>
                            </div>

                            <div className="article-card__content">
                                <h3 className="article-card__title">{article.title}</h3>
                                <p className="article-card__excerpt">{article.excerpt}</p>

                                {/* Причина отклонения */}
                                {article.status === 'rejected' && article.moderationNote && (
                                    <div className="article-card__moderation-note">
                                        <strong>Dôvod zamietnutia:</strong> {article.moderationNote}
                                    </div>
                                )}
                            </div>

                            <div className="article-card__footer">
                                <div className="article-card__stats">
                                    <span className="article-card__stat">👁️ {article.views || 0}</span>
                                    <span className="article-card__stat">💬 {article.commentsCount || 0}</span>
                                </div>

                                <div className="article-card__actions">
                                    {/* Опубликованные статьи - только просмотр */}
                                    {article.status === 'published' && (
                                        <a
                                            href={`/clanky/${article.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="article-card__action-btn article-card__view-btn"
                                        >
                                            👁️ Zobraziť
                                        </a>
                                    )}

                                    {/* Черновики - редактировать и отправить на модерацию */}
                                    {article.status === 'draft' && (
                                        <>
                                            <Link
                                                href={`/profil/upravit-clanok/${article._id}`}
                                                className="article-card__action-btn article-card__edit-btn"
                                            >
                                                ✏️ Upraviť
                                            </Link>
                                            <button
                                                onClick={() => handleSubmitForReview(article._id)}
                                                className="article-card__action-btn article-card__submit-btn"
                                            >
                                                📤 Odoslať na moderáciu
                                            </button>
                                        </>
                                    )}

                                    {/* На модерации - только просмотр */}
                                    {article.status === 'pending' && (
                                        <span className="article-card__info">
                                            ⏳ Čaká sa na schválenie administrátorom
                                        </span>
                                    )}

                                    {/* Отклоненные - редактировать и отправить снова */}
                                    {article.status === 'rejected' && (
                                        <>
                                            <Link
                                                href={`/profil/upravit-clanok/${article._id}`}
                                                className="article-card__action-btn article-card__edit-btn"
                                            >
                                                ✏️ Upraviť
                                            </Link>
                                            <button
                                                onClick={() => handleSubmitForReview(article._id)}
                                                className="article-card__action-btn article-card__submit-btn"
                                            >
                                                📤 Odoslať znova
                                            </button>
                                        </>
                                    )}

                                    {/* Удаление (для всех кроме published) */}
                                    {article.status !== 'published' && article.status !== 'pending' && (
                                        <button
                                            onClick={() => handleDelete(article._id)}
                                            className="article-card__action-btn article-card__delete-btn"
                                        >
                                            🗑️ Vymazať
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyArticlesPage;