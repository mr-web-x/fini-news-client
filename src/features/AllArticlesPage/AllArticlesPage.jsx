"use client";

import "./AllArticlesPage.scss";
import { useState, useEffect } from "react";
import { getAllArticlesForAdmin, getPendingArticles, getMyArticles, approveArticle, rejectArticle, deleteArticle } from "@/actions/articles.actions";
import CommentModal from "@/components/Modal/CommentModal"; // ✅ добавлено

const AllArticlesPage = ({ user }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [filter, setFilter] = useState('moderation'); // moderation, all, draft, pending, published, rejected
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, views, popular
    const [stats, setStats] = useState({
        total: 0,
        draft: 0,
        pending: 0,
        published: 0,
        rejected: 0,
        totalViews: 0,
        totalComments: 0
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [rejectReason, setRejectReason] = useState('');
    const [rejectingArticleId, setRejectingArticleId] = useState(null);

    // ✅ Comments state
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [selectedArticleId, setSelectedArticleId] = useState(null);

    const handleOpenCommentModal = (articleId) => {
        setSelectedArticleId(articleId);
        setShowCommentModal(true);
    };

    // Загружаем общую статистику при монтировании компонента
    useEffect(() => {
        loadAllStats();
    }, []);

    // Загружаем статьи при изменении фильтров
    useEffect(() => {
        loadArticles();
    }, [filter, sortBy]);

    // Debounce для поиска
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm) {
                loadArticles();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    /**
     * Загрузка общей статистики по всем статьям
     * Вызывается один раз при монтировании
     */
    const loadAllStats = async () => {
        setStatsLoading(true);

        try {
            let result;

            if (user?.role === 'admin') {
                result = await getAllArticlesForAdmin({ limit: 100 });
            } else {
                result = await getMyArticles('all');
            }

            if (result.success) {
                const articles = result.data.articles || result.data || [];

                const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
                const totalComments = articles.reduce((sum, a) => sum + (a.commentsCount || 0), 0);

                const newStats = {
                    total: articles.length,
                    draft: articles.filter(a => a.status === 'draft').length,
                    pending: articles.filter(a => a.status === 'pending').length,
                    published: articles.filter(a => a.status === 'published').length,
                    rejected: articles.filter(a => a.status === 'rejected').length,
                    totalViews,
                    totalComments
                };

                setStats(newStats);
            }

        } catch (error) {
            console.error('❌ Error loading stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    /**
     * Загрузка статей по текущему фильтру
     */
    const loadArticles = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            let result;

            // =========================
            // ЕСЛИ АДМИН
            // =========================
            if (user?.role === 'admin') {

                if (filter === 'moderation') {
                    result = await getPendingArticles();
                } else {
                    const filters = {
                        status: filter !== 'all' ? filter : undefined,
                        search: searchTerm || undefined,
                        sort: sortBy,
                        limit: 100
                    };
                    result = await getAllArticlesForAdmin(filters);
                }

            }
            // =========================
            // ЕСЛИ АВТОР
            // =========================
            else {
                result = await getMyArticles(filter !== 'all' ? filter : null);
            }

            // =========================
            // ОБРАБОТКА РЕЗУЛЬТАТА
            // =========================
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

    const handleApprove = async (articleId) => {
        if (!confirm('Schváliť a publikovať tento článok?')) return;

        try {
            const result = await approveArticle(articleId);

            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                loadArticles();
                loadAllStats();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            console.error('Error approving article:', error);
            setMessage({ type: 'error', text: 'Chyba pri schvaľovaní článku' });
        }
    };

    const handleRejectClick = (articleId) => {
        setRejectingArticleId(articleId);
        setRejectReason('');
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason || rejectReason.trim().length < 10) {
            alert('Zadajte dôvod zamietnutia (minimálne 10 znakov)');
            return;
        }

        try {
            const result = await rejectArticle(rejectingArticleId, rejectReason);

            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setRejectingArticleId(null);
                setRejectReason('');
                loadArticles();
                loadAllStats();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            console.error('Error rejecting article:', error);
            setMessage({ type: 'error', text: 'Chyba pri zamietaní článku' });
        }
    };

    const handleDelete = async (articleId) => {
        if (!confirm('Naozaj chcete vymazať tento článok? Táto akcia sa nedá vrátiť späť.')) return;

        try {
            const result = await deleteArticle(articleId);

            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                loadArticles();
                loadAllStats();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            setMessage({ type: 'error', text: 'Chyba pri mazaní článku' });
        }
    };

    return (
        <div className="all-articles-page">
            <div className="all-articles__header">
                <h1>Všetky články v systéme</h1>
                <p>Spravujte všetky články v systéme, ich stavy a moderáciu</p>
            </div>

            {message.text && (
                <div className={`all-articles__message all-articles__message--${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="all-articles__stats">
                <div className="all-articles__stat-card">
                    <div className="all-articles__stat-number">
                        {statsLoading ? '...' : stats.total}
                    </div>
                    <div className="all-articles__stat-label">Celkovo článkov</div>
                </div>
                <div className="all-articles__stat-card all-articles__stat-card--warning">
                    <div className="all-articles__stat-number">
                        {statsLoading ? '...' : stats.pending}
                    </div>
                    <div className="all-articles__stat-label">⚠️ Na moderácii</div>
                </div>
                <div className="all-articles__stat-card">
                    <div className="all-articles__stat-number">
                        {statsLoading ? '...' : stats.published}
                    </div>
                    <div className="all-articles__stat-label">Publikované</div>
                </div>
                <div className="all-articles__stat-card">
                    <div className="all-articles__stat-number">
                        {statsLoading ? '...' : stats.totalViews}
                    </div>
                    <div className="all-articles__stat-label">Celkové zobrazenia</div>
                </div>
            </div>

            <div className="all-articles__controls">
                <div className="all-articles__search">
                    <input
                        type="text"
                        placeholder="Hľadať články, autorov..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="all-articles__search-input"
                        disabled={filter === 'moderation'}
                    />
                </div>

                <div className="all-articles__sort">
                    <label>Zoradiť podľa:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="all-articles__sort-select"
                    >
                        <option value="newest">Najnovšie</option>
                        <option value="oldest">Najstaršie</option>
                        <option value="views">Počet zobrazení</option>
                        <option value="popular">Popularita</option>
                    </select>
                </div>
            </div>

            <div className="all-articles__filters">
                <button
                    onClick={() => setFilter('moderation')}
                    className={`all-articles__filter-btn ${filter === 'moderation' ? 'all-articles__filter-btn--active' : ''}`}
                >
                    ⚠️ Zapro sy na moderáciu ({statsLoading ? '...' : stats.pending})
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`all-articles__filter-btn ${filter === 'all' ? 'all-articles__filter-btn--active' : ''}`}
                >
                    Všetky ({statsLoading ? '...' : stats.total})
                </button>
                <button
                    onClick={() => setFilter('draft')}
                    className={`all-articles__filter-btn ${filter === 'draft' ? 'all-articles__filter-btn--active' : ''}`}
                >
                    Koncepty ({statsLoading ? '...' : stats.draft})
                </button>
                <button
                    onClick={() => setFilter('published')}
                    className={`all-articles__filter-btn ${filter === 'published' ? 'all-articles__filter-btn--active' : ''}`}
                >
                    Publikované ({statsLoading ? '...' : stats.published})
                </button>
                <button
                    onClick={() => setFilter('rejected')}
                    className={`all-articles__filter-btn ${filter === 'rejected' ? 'all-articles__filter-btn--active' : ''}`}
                >
                    Zamietnuté ({statsLoading ? '...' : stats.rejected})
                </button>
            </div>

            <div className="all-articles__list">
                {loading ? (
                    <div className="all-articles__loading">
                        <div className="spinner"></div>
                        <p>Načítavam články...</p>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="all-articles__empty">
                        <div className="all-articles__empty-icon">📭</div>
                        <h3>Žiadne články</h3>
                        <p>
                            {filter === 'moderation'
                                ? 'Momentálne nie sú žiadne články na moderáciu.'
                                : 'V tejto kategórii nie sú žiadne články.'}
                        </p>
                    </div>
                ) : (
                    articles.map(article => (
                        <div key={article._id} className="admin-article-card">
                            <div className="admin-article-card__header">
                                <div className="admin-article-card__meta">
                                    <span className={`admin-article-card__status ${getStatusColor(article.status)}`}>
                                        {getStatusLabel(article.status)}
                                    </span>
                                    <span className="admin-article-card__date">
                                        {formatDate(article.createdAt)}
                                    </span>
                                    <span className="admin-article-card__author">
                                        👤 {article.author?.displayName || 'Neznámy'}
                                    </span>
                                </div>
                            </div>

                            <div className="admin-article-card__content">
                                <h3 className="admin-article-card__title">
                                    {article.status === 'published' ? (
                                        <a href={`/clanky/${article.slug}`} target="_blank" rel="noopener noreferrer">
                                            {article.title}
                                        </a>
                                    ) : (
                                        article.title
                                    )}
                                </h3>
                                <p className="admin-article-card__excerpt">{article.excerpt}</p>

                                {article.status === 'rejected' && article.moderationNote && (
                                    <div className="admin-article-card__moderation-note">
                                        <strong>Dôvod zamietnutia:</strong> {article.moderationNote}
                                    </div>
                                )}
                            </div>

                            <div className="admin-article-card__stats">
                                <span className="admin-article-card__stat">👁️ {article.views || 0}</span>
                                <button
                                    className="admin-article-card__stat admin-article-card__comments-btn"
                                    onClick={() => handleOpenCommentModal(article._id)}
                                >
                                    💬 {article.commentsCount || 0}
                                </button>
                            </div>

                            <div className="admin-article-card__actions">
                                {article.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(article._id)}
                                            className="admin-article-card__action-btn admin-article-card__approve-btn"
                                        >
                                            ✅ Schváliť
                                        </button>
                                        <button
                                            onClick={() => handleRejectClick(article._id)}
                                            className="admin-article-card__action-btn admin-article-card__reject-btn"
                                        >
                                            ❌ Zamietnuť
                                        </button>
                                    </>
                                )}

                                {article.status === 'published' && (
                                    <a
                                        href={`/clanky/${article.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="admin-article-card__action-btn admin-article-card__view-btn"
                                    >
                                        👁️ Zobraziť
                                    </a>
                                )}

                                <button
                                    onClick={() => handleDelete(article._id)}
                                    className="admin-article-card__action-btn admin-article-card__delete-btn"
                                >
                                    🗑️ Vymazať
                                </button>
                            </div>

                            {rejectingArticleId === article._id && (
                                <div className="admin-article-card__reject-modal">
                                    <h4>Dôvod zamietnutia článku</h4>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Zadajte dôvod zamietnutia (minimálne 10 znakov)..."
                                        rows="4"
                                        className="admin-article-card__reject-textarea"
                                    />
                                    <div className="admin-article-card__reject-actions">
                                        <button
                                            onClick={() => {
                                                setRejectingArticleId(null);
                                                setRejectReason('');
                                            }}
                                            className="admin-article-card__action-btn"
                                        >
                                            Zrušiť
                                        </button>
                                        <button
                                            onClick={handleRejectSubmit}
                                            className="admin-article-card__action-btn admin-article-card__reject-btn"
                                            disabled={!rejectReason || rejectReason.trim().length < 10}
                                        >
                                            Zamietnuť článok
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* ✅ Модальное окно для добавления комментариев */}
            {showCommentModal && (
                <CommentModal
                    articleId={selectedArticleId}
                    isOpen={showCommentModal}
                    onClose={() => setShowCommentModal(false)}
                    onSuccess={() => {
                        loadArticles(); // обновляем счётчик комментариев после добавления
                    }}
                />
            )}
        </div>
    );
};

export default AllArticlesPage;
