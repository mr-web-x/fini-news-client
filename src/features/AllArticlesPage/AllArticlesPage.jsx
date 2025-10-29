"use client";

import { useState, useEffect } from "react";
import { getAllArticlesForAdmin, getPendingArticles, getMyArticles, approveArticle, rejectArticle, deleteArticle } from "@/actions/articles.actions";
import ArticleCard from "@/components/ArticleCard/ArticleCard";
import Modal from "@/components/Modal/Modal";
import "./AllArticlesPage.scss";

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

    // ✅ Состояния для модалки отклонения
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingArticleId, setRejectingArticleId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

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

                setStats({
                    total: articles.length,
                    draft: articles.filter(a => a.status === 'draft').length,
                    pending: articles.filter(a => a.status === 'pending').length,
                    published: articles.filter(a => a.status === 'published').length,
                    rejected: articles.filter(a => a.status === 'rejected').length,
                    totalViews,
                    totalComments
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
    const loadArticles = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            let result;

            if (filter === 'moderation') {
                result = await getPendingArticles({ sort: sortBy, search: searchTerm });
            } else {
                result = await getAllArticlesForAdmin({
                    status: filter === 'all' ? undefined : filter,
                    sort: sortBy,
                    search: searchTerm
                });
            }

            if (result.success) {
                const articlesData = result.data.articles || result.data || [];
                setArticles(articlesData);
            } else {
                setMessage({ type: 'error', text: result.message });
                setArticles([]);
            }
        } catch (error) {
            console.error('Error loading articles:', error);
            setMessage({ type: 'error', text: 'Chyba pri načítavaní článkov' });
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (articleId) => {
        if (!confirm('Naozaj chcete schváliť a publikovať tento článok?')) return;

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

    // ✅ Открыть модалку отклонения
    const handleRejectClick = (articleId) => {
        setRejectingArticleId(articleId);
        setRejectReason('');
        setShowRejectModal(true);
    };

    // ✅ Отклонить статью
    const handleRejectSubmit = async () => {
        if (!rejectReason || rejectReason.trim().length < 10) {
            alert('Zadajte dôvod zamietnutia (minimálne 10 znakov)');
            return;
        }

        try {
            const result = await rejectArticle(rejectingArticleId, rejectReason);

            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setShowRejectModal(false);
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
                    <div className="all-articles__stat-label">Celkom článkov</div>
                </div>
                <div className="all-articles__stat-card">
                    <div className="all-articles__stat-number all-articles__stat-number--pending">
                        {statsLoading ? '...' : stats.pending}
                    </div>
                    <div className="all-articles__stat-label">Na moderácii</div>
                </div>
                <div className="all-articles__stat-card">
                    <div className="all-articles__stat-number all-articles__stat-number--published">
                        {statsLoading ? '...' : stats.published}
                    </div>
                    <div className="all-articles__stat-label">Publikované</div>
                </div>
                <div className="all-articles__stat-card">
                    <div className="all-articles__stat-number all-articles__stat-number--rejected">
                        {statsLoading ? '...' : stats.rejected}
                    </div>
                    <div className="all-articles__stat-label">Zamietnuté</div>
                </div>
            </div>

            {/* Controls */}
            <div className="all-articles__controls">
                <input
                    type="text"
                    placeholder="🔍 Hľadať článok..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="all-articles__search"
                />

                <div className="all-articles__sort">
                    <label htmlFor="sort">Zoradiť:</label>
                    <select
                        id="sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="all-articles__sort-select"
                    >
                        <option value="newest">Najnovšie</option>
                        <option value="oldest">Najstaršie</option>
                        <option value="views">Najčítanejšie</option>
                        <option value="popular">Najpopulárnejšie</option>
                    </select>
                </div>
            </div>

            {/* Filters */}
            <div className="all-articles__filters">
                <button
                    onClick={() => setFilter('moderation')}
                    className={`all-articles__filter-btn ${filter === 'moderation' ? 'all-articles__filter-btn--active' : ''}`}
                >
                    🔔 Na moderácii ({statsLoading ? '...' : stats.pending})
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

            {/* Articles List */}
            <div className="all-articles__list">
                {loading ? (
                    <div className="all-articles__loading">
                        <div className="spinner"></div>
                        <p>Načítavam články...</p>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="all-articles__empty">
                        <div className="all-articles__empty-icon">📝</div>
                        <h3>Žiadne články</h3>
                        <p>V tejto kategórii nie sú žiadne články.</p>
                    </div>
                ) : (
                    articles.map(article => (
                        <ArticleCard
                            key={article._id}
                            article={article}
                            variant="admin"
                            onDelete={handleDelete}
                            onApprove={handleApprove}
                            onReject={handleRejectClick}
                        />
                    ))
                )}
            </div>

            {/* ✅ Модальное окно для отклонения статьи */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => {
                    setShowRejectModal(false);
                    setRejectingArticleId(null);
                    setRejectReason('');
                }}
                title="Zamietnuť článok"
                size="medium"
            >
                <div className="reject-modal">
                    <p className="reject-modal__description">
                        Uveďte dôvod zamietnutia článku. Autor dostane túto správu.
                    </p>

                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Napríklad: Článok neobsahuje dostatočné zdroje, je potrebné doplniť obrázky..."
                        className="reject-modal__textarea"
                        rows="5"
                    />

                    <div className="reject-modal__char-count">
                        {rejectReason.length}/500 znakov (min. 10)
                    </div>

                    <div className="reject-modal__actions">
                        <button
                            onClick={() => {
                                setShowRejectModal(false);
                                setRejectingArticleId(null);
                                setRejectReason('');
                            }}
                            className="reject-modal__btn reject-modal__btn--cancel"
                        >
                            Zrušiť
                        </button>
                        <button
                            onClick={handleRejectSubmit}
                            className="reject-modal__btn reject-modal__btn--reject"
                            disabled={!rejectReason || rejectReason.trim().length < 10}
                        >
                            Zamietnuť článok
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AllArticlesPage;