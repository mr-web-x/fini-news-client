"use client";

import { useState, useEffect } from "react";
import { getAllArticlesForAdmin, approveArticle, rejectArticle, deleteArticle } from "@/actions/articles.actions";
import "./AllArticlesPage.scss";

const AllArticlesPage = ({ user }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, draft, pending, published, rejected
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

    useEffect(() => {
        loadAllArticles();
    }, [filter, sortBy]);

    // Debounce для поиска
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm) {
                loadAllArticles();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadAllArticles = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Подготовка фильтров для API
            const filters = {
                status: filter !== 'all' ? filter : undefined,
                search: searchTerm || undefined,
                sort: sortBy,
                limit: 100 // можно добавить пагинацию позже
            };

            // Получаем все статьи через Server Action
            const result = await getAllArticlesForAdmin(filters);

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
            const totalComments = articlesData.reduce((sum, article) => sum + (article.commentsCount || 0), 0);

            setStats({
                total: articlesData.length,
                draft: articlesData.filter(a => a.status === 'draft').length,
                pending: articlesData.filter(a => a.status === 'pending').length,
                published: articlesData.filter(a => a.status === 'published').length,
                rejected: articlesData.filter(a => a.status === 'rejected').length,
                totalViews,
                totalComments
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

    const handleApprove = async (articleId) => {
        if (!confirm('Schváliť a publikovať tento článok?')) {
            return;
        }

        try {
            const result = await approveArticle(articleId);

            if (result.success) {
                setMessage({ type: 'success', text: 'Článok bol schválený a publikovaný' });

                // Обновляем статус статьи в списке
                setArticles(prev => prev.map(article =>
                    article._id === articleId
                        ? { ...article, status: 'published', publishedAt: new Date().toISOString() }
                        : article
                ));

                // Обновляем статистику
                setStats(prev => ({
                    ...prev,
                    pending: prev.pending - 1,
                    published: prev.published + 1
                }));

                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: result.message });
                setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            }
        } catch (error) {
            console.error('Error approving article:', error);
            setMessage({ type: 'error', text: 'Chyba pri schvaľovaní článku' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    const handleReject = async (articleId) => {
        const reason = prompt('Dôvod zamietnutia (povinné, minimálne 10 znakov):');

        if (reason === null) {
            // User cancelled
            return;
        }

        if (!reason || reason.trim().length < 10) {
            alert('Dôvod zamietnutia musí obsahovať minimálne 10 znakov');
            return;
        }

        try {
            const result = await rejectArticle(articleId, reason.trim());

            if (result.success) {
                setMessage({ type: 'success', text: 'Článok bol zamietnutý' });

                // Обновляем статус статьи в списке
                setArticles(prev => prev.map(article =>
                    article._id === articleId
                        ? { ...article, status: 'rejected', moderationNote: reason.trim() }
                        : article
                ));

                // Обновляем статистику
                setStats(prev => ({
                    ...prev,
                    pending: prev.pending - 1,
                    rejected: prev.rejected + 1
                }));

                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: result.message });
                setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            }
        } catch (error) {
            console.error('Error rejecting article:', error);
            setMessage({ type: 'error', text: 'Chyba pri zamietnutí článku' });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    const handleDelete = async (articleId) => {
        if (!confirm('Ste si istí, že chcete vymazať tento článok? Táto akcia je nenávratná!')) {
            return;
        }

        try {
            const result = await deleteArticle(articleId);

            if (result.success) {
                setMessage({ type: 'success', text: 'Článok bol vymazaný' });

                // Убираем статью из списка
                setArticles(prev => prev.filter(article => article._id !== articleId));

                // Обновляем статистику
                setStats(prev => ({
                    ...prev,
                    total: prev.total - 1
                }));

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

    if (loading) {
        return (
            <div className="articles-loading">
                <div className="spinner"></div>
                <p>Načítavam články...</p>
            </div>
        );
    }

    return (
        <div className="all-articles-page">
            <div className="all-articles__header">
                <h1>Všetky články</h1>
                <p>Spravujte všetky články v systéme, ich stavy a moderáciu</p>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`all-articles__message all-articles__message--${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Statistics */}
            <div className="all-articles__stats">
                <div className="all-articles__stat-card">
                    <div className="all-articles__stat-number">{stats.total}</div>
                    <div className="all-articles__stat-label">Celkovo článkov</div>
                </div>
                <div className="all-articles__stat-card">
                    <div className="all-articles__stat-number">{stats.pending}</div>
                    <div className="all-articles__stat-label">Na moderácii</div>
                </div>
                <div className="all-articles__stat-card">
                    <div className="all-articles__stat-number">{stats.published}</div>
                    <div className="all-articles__stat-label">Publikované</div>
                </div>
                <div className="all-articles__stat-card">
                    <div className="all-articles__stat-number">{stats.totalViews}</div>
                    <div className="all-articles__stat-label">Celkové zobrazenia</div>
                </div>
            </div>

            {/* Controls */}
            <div className="all-articles__controls">
                <div className="all-articles__search">
                    <input
                        type="text"
                        placeholder="Hľadať články, autorov..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="all-articles__search-input"
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

            {/* Filter Tabs */}
            <div className="all-articles__filters">
                <button
                    onClick={() => setFilter('all')}
                    className={`all-articles__filter-btn ${filter === 'all' ? 'active' : ''}`}
                >
                    Všetky ({stats.total})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`all-articles__filter-btn ${filter === 'pending' ? 'active' : ''}`}
                >
                    Na moderácii ({stats.pending})
                </button>
                <button
                    onClick={() => setFilter('published')}
                    className={`all-articles__filter-btn ${filter === 'published' ? 'active' : ''}`}
                >
                    Publikované ({stats.published})
                </button>
                <button
                    onClick={() => setFilter('draft')}
                    className={`all-articles__filter-btn ${filter === 'draft' ? 'active' : ''}`}
                >
                    Koncepty ({stats.draft})
                </button>
                <button
                    onClick={() => setFilter('rejected')}
                    className={`all-articles__filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                >
                    Zamietnuté ({stats.rejected})
                </button>
            </div>

            {/* Articles List */}
            <div className="all-articles__list">
                {articles.length === 0 ? (
                    <div className="all-articles__empty">
                        <div className="all-articles__empty-icon">📝</div>
                        <h3>Žiadne články</h3>
                        <p>
                            {searchTerm
                                ? `Nenašli sa žiadne články pre hľadanie "${searchTerm}"`
                                : filter === 'all'
                                    ? 'V systéme zatiaľ nie sú žiadne články.'
                                    : `Nie sú žiadne články so stavom "${getStatusLabel(filter)}".`
                            }
                        </p>
                    </div>
                ) : (
                    articles.map(article => (
                        <div key={article._id} className="admin-article-card">
                            <div className="admin-article-card__header">
                                <div className="admin-article-card__header-left">
                                    <span className={`admin-article-card__status ${getStatusColor(article.status)}`}>
                                        {getStatusLabel(article.status)}
                                    </span>
                                    <span className="admin-article-card__author">
                                        👤 {article.author?.displayName || article.author?.email || 'Neznámy autor'}
                                    </span>
                                </div>
                                <span className="admin-article-card__date">
                                    {formatDate(article.updatedAt)}
                                </span>
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

                                {/* Показываем причину отклонения если есть */}
                                {article.status === 'rejected' && article.moderationNote && (
                                    <div className="admin-article-card__moderation-note">
                                        <strong>Dôvod zamietnutia:</strong> {article.moderationNote}
                                    </div>
                                )}
                            </div>

                            <div className="admin-article-card__footer">
                                <div className="admin-article-card__stats">
                                    <span className="admin-article-card__stat">👁️ {article.views || 0}</span>
                                    <span className="admin-article-card__stat">💬 {article.commentsCount || 0}</span>
                                </div>

                                <div className="admin-article-card__actions">
                                    {/* Модерация для статей на рассмотрении */}
                                    {article.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(article._id)}
                                                className="admin-article-card__action-btn admin-article-card__approve-btn"
                                            >
                                                ✅ Schváliť
                                            </button>
                                            <button
                                                onClick={() => handleReject(article._id)}
                                                className="admin-article-card__action-btn admin-article-card__reject-btn"
                                            >
                                                ❌ Zamietnuť
                                            </button>
                                        </>
                                    )}

                                    {/* Просмотр опубликованных статей */}
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

                                    {/* Удаление (для всех статей кроме опубликованных) */}
                                    {article.status !== 'published' && (
                                        <button
                                            onClick={() => handleDelete(article._id)}
                                            className="admin-article-card__action-btn admin-article-card__delete-btn"
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

export default AllArticlesPage;