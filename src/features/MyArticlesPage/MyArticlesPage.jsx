"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMyArticles, deleteArticle, submitArticleForReview } from "@/actions/articles.actions";
import "./MyArticlesPage.scss";

const MyArticlesPage = ({ user }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        loadUserArticles();
    }, [filter]);

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

            // Калkulácia štatistík
            const totalViews = articlesData.reduce((sum, article) => sum + (article.views || 0), 0);
            setStats({
                total: articlesData.length,
                draft: articlesData.filter(a => a.status === 'draft').length,
                pending: articlesData.filter(a => a.status === 'pending').length,
                published: articlesData.filter(a => a.status === 'published').length,
                rejected: articlesData.filter(a => a.status === 'rejected').length,
                totalViews
            });

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
        if (!confirm('Ste si istí, že chcete vymazať tento článok?')) {
            return;
        }

        try {
            const result = await deleteArticle(articleId);

            if (result.success) {
                setMessage({ type: 'success', text: 'Článok bol úspešne vymazaný' });
                // Убираем статью из списка
                setArticles(prev => prev.filter(article => article._id !== articleId));

                // Обновляем статистику
                setStats(prev => ({
                    ...prev,
                    total: prev.total - 1
                }));

                // Очищаем сообщение через 3 секунды
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: result.message });
                setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            setMessage({ type: 'error', text: 'Chyba pri mazaní článku' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    const handleSubmitForReview = async (articleId) => {
        if (!confirm('Odoslať článok na moderáciu? Potom ho už nebudete môcť upravovať.')) {
            return;
        }

        try {
            const result = await submitArticleForReview(articleId);

            if (result.success) {
                setMessage({ type: 'success', text: 'Článok bol odoslaný na moderáciu' });

                // Обновляем статус статьи в списке
                setArticles(prev => prev.map(article =>
                    article._id === articleId
                        ? { ...article, status: 'pending' }
                        : article
                ));

                // Обновляем статистику
                setStats(prev => ({
                    ...prev,
                    draft: prev.draft - 1,
                    pending: prev.pending + 1
                }));

                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: result.message });
                setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            }
        } catch (error) {
            console.error('Error submitting article:', error);
            setMessage({ type: 'error', text: 'Chyba pri odosielaní článku' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    const filteredArticles = filter === 'all'
        ? articles
        : articles.filter(article => article.status === filter);

    if (loading) {
        return (
            <div className="articles-loading">
                <div className="spinner"></div>
                <p>Načítavam články...</p>
            </div>
        );
    }

    return (
        <div className="my-articles-page">
            <div className="articles__header">
                <div className="articles__header-content">
                    <h1>Moje články</h1>
                    <p>Spravujte svoje články a sledujte ich výkonnosť</p>
                </div>
                <Link href="/profil/novy-clanok" className="articles__new-btn">
                    ➕ Nový článok
                </Link>
            </div>

            {/* Message (success/error) */}
            {message.text && (
                <div className={`articles__message articles__message--${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Statistics */}
            <div className="articles__stats">
                <div className="articles__stat-card">
                    <div className="articles__stat-number">{stats.total}</div>
                    <div className="articles__stat-label">Celkovo článkov</div>
                </div>
                <div className="articles__stat-card">
                    <div className="articles__stat-number">{stats.published}</div>
                    <div className="articles__stat-label">Publikované</div>
                </div>
                <div className="articles__stat-card">
                    <div className="articles__stat-number">{stats.pending}</div>
                    <div className="articles__stat-label">Na moderácii</div>
                </div>
                <div className="articles__stat-card">
                    <div className="articles__stat-number">{stats.totalViews}</div>
                    <div className="articles__stat-label">Celkové zobrazenia</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="articles__filters">
                <button
                    onClick={() => setFilter('all')}
                    className={`articles__filter-btn ${filter === 'all' ? 'active' : ''}`}
                >
                    Všetky ({stats.total})
                </button>
                <button
                    onClick={() => setFilter('published')}
                    className={`articles__filter-btn ${filter === 'published' ? 'active' : ''}`}
                >
                    Publikované ({stats.published})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`articles__filter-btn ${filter === 'pending' ? 'active' : ''}`}
                >
                    Na moderácii ({stats.pending})
                </button>
                <button
                    onClick={() => setFilter('draft')}
                    className={`articles__filter-btn ${filter === 'draft' ? 'active' : ''}`}
                >
                    Koncepty ({stats.draft})
                </button>
                <button
                    onClick={() => setFilter('rejected')}
                    className={`articles__filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                >
                    Zamietnuté ({stats.rejected})
                </button>
            </div>

            {/* Articles List */}
            <div className="articles__list">
                {filteredArticles.length === 0 ? (
                    <div className="articles__empty">
                        <div className="articles__empty-icon">📝</div>
                        <h3>Žiadne články</h3>
                        <p>
                            {filter === 'all'
                                ? 'Zatiaľ ste nevytvorili žiadne články. Začnite písať svoj první článok!'
                                : `Nemáte žiadne články so stavom "${getStatusLabel(filter)}".`
                            }
                        </p>
                        {filter === 'all' && (
                            <Link href="/profil/novy-clanok" className="articles__empty-btn">
                                ➕ Vytvoriť prvý článok
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredArticles.map(article => (
                        <div key={article._id} className="article-card">
                            <div className="article-card__header">
                                <span className={`article-card__status ${getStatusColor(article.status)}`}>
                                    {getStatusLabel(article.status)}
                                </span>
                                <span className="article-card__date">
                                    {formatDate(article.updatedAt)}
                                </span>
                            </div>

                            <div className="article-card__content">
                                <h3 className="article-card__title">
                                    {article.status === 'published' ? (
                                        <a href={`/clanky/${article.slug}`} target="_blank" rel="noopener noreferrer">
                                            {article.title}
                                        </a>
                                    ) : (
                                        article.title
                                    )}
                                </h3>
                                <p className="article-card__excerpt">{article.excerpt}</p>

                                {/* Показываем причину отклонения если есть */}
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
                                    {/* Редактирование доступно только для draft и rejected */}
                                    {(article.status === 'draft' || article.status === 'rejected') && (
                                        <Link
                                            href={`/profil/upravit-clanok/${article._id}`}
                                            className="article-card__action-btn article-card__edit-btn"
                                        >
                                            ✏️ Upraviť
                                        </Link>
                                    )}

                                    {/* Кнопка отправки на модерацию для черновиков и отклонённых */}
                                    {(article.status === 'draft' || article.status === 'rejected') && (
                                        <button
                                            onClick={() => handleSubmitForReview(article._id)}
                                            className="article-card__action-btn article-card__submit-btn"
                                        >
                                            📤 Odoslať na moderáciu
                                        </button>
                                    )}

                                    {/* Просмотр опубликованных статей */}
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

                                    {/* Удаление доступно для всех статей кроме опубликованных */}
                                    {article.status !== 'published' && (
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