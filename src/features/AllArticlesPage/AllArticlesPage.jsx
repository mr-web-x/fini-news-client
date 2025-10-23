"use client";

import { useState, useEffect } from "react";
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

    useEffect(() => {
        loadAllArticles();
    }, [filter, searchTerm, sortBy]);

    const loadAllArticles = async () => {
        setLoading(true);
        try {
            // TODO: заменить на реальный API вызов
            // const result = await getAllArticles(filter, searchTerm, sortBy);

            // Моковые данные всех статей в системе
            const mockArticles = [
                {
                    id: 1,
                    title: "Ako investovať do kryptomien v roku 2025",
                    slug: "ako-investovat-kryptomeny-2025",
                    excerpt: "Kompletný sprievodca investovaním do kryptomien pre začiatočníkov...",
                    author: {
                        id: 2,
                        displayName: "Mária Svobodová",
                        email: "maria.svobodova@gmail.com"
                    },
                    status: "published",
                    views: 1245,
                    likes: 23,
                    comments: 8,
                    createdAt: "2025-01-15T10:30:00Z",
                    updatedAt: "2025-01-18T14:20:00Z",
                    publishedAt: "2025-01-18T14:20:00Z"
                },
                {
                    id: 2,
                    title: "Budúcnosť umelej inteligencie",
                    slug: "buducnost-umelej-inteligencie",
                    excerpt: "Analýza trendov AI a ich vplyv na spoločnosť...",
                    author: {
                        id: 3,
                        displayName: "Peter Kováč",
                        email: "peter.kovac@gmail.com"
                    },
                    status: "pending",
                    views: 0,
                    likes: 0,
                    comments: 0,
                    createdAt: "2025-01-20T09:15:00Z",
                    updatedAt: "2025-01-20T09:15:00Z",
                    publishedAt: null
                },
                {
                    id: 3,
                    title: "Tipy pre efektívne home office",
                    slug: "tipy-efektivne-home-office",
                    excerpt: "Praktické rady ako zlepšiť produktivitu pri práci z domu...",
                    author: {
                        id: 2,
                        displayName: "Mária Svobodová",
                        email: "maria.svobodova@gmail.com"
                    },
                    status: "draft",
                    views: 0,
                    likes: 0,
                    comments: 0,
                    createdAt: "2025-01-19T16:45:00Z",
                    updatedAt: "2025-01-19T18:30:00Z",
                    publishedAt: null
                },
                {
                    id: 4,
                    title: "Finančné plánovanie pre mladých",
                    slug: "financne-planovanie-mladi",
                    excerpt: "Základy finančného plánovania pre ľudí do 30 rokov...",
                    author: {
                        id: 4,
                        displayName: "Tomáš Novotný",
                        email: "tomas.novotny@gmail.com"
                    },
                    status: "rejected",
                    views: 0,
                    likes: 0,
                    comments: 0,
                    createdAt: "2025-01-17T12:00:00Z",
                    updatedAt: "2025-01-17T12:00:00Z",
                    publishedAt: null,
                    moderationNote: "Článok obsahuje neoverené informácie. Prosím, pridajte zdroje."
                }
            ];

            // Фильтрация и поиск
            let filteredArticles = mockArticles;
            if (filter !== 'all') {
                filteredArticles = mockArticles.filter(a => a.status === filter);
            }

            if (searchTerm) {
                filteredArticles = filteredArticles.filter(a =>
                    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.author.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Сортировка
            filteredArticles.sort((a, b) => {
                switch (sortBy) {
                    case 'newest':
                        return new Date(b.updatedAt) - new Date(a.updatedAt);
                    case 'oldest':
                        return new Date(a.updatedAt) - new Date(b.updatedAt);
                    case 'views':
                        return b.views - a.views;
                    case 'popular':
                        return (b.likes + b.comments) - (a.likes + a.comments);
                    default:
                        return 0;
                }
            });

            setArticles(filteredArticles);

            // Калkulácia štatistík
            const totalViews = mockArticles.reduce((sum, article) => sum + article.views, 0);
            const totalComments = mockArticles.reduce((sum, article) => sum + article.comments, 0);
            setStats({
                total: mockArticles.length,
                draft: mockArticles.filter(a => a.status === 'draft').length,
                pending: mockArticles.filter(a => a.status === 'pending').length,
                published: mockArticles.filter(a => a.status === 'published').length,
                rejected: mockArticles.filter(a => a.status === 'rejected').length,
                totalViews,
                totalComments
            });

        } catch (error) {
            console.error('Error loading articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (articleId, newStatus, moderationNote = '') => {
        try {
            // TODO: API call to change article status
            // await updateArticleStatus(articleId, newStatus, moderationNote);

            setArticles(prev => prev.map(article =>
                article.id === articleId
                    ? {
                        ...article,
                        status: newStatus,
                        moderationNote: moderationNote || article.moderationNote,
                        publishedAt: newStatus === 'published' ? new Date().toISOString() : article.publishedAt
                    }
                    : article
            ));
        } catch (error) {
            console.error('Error changing article status:', error);
        }
    };

    const handleDelete = async (articleId) => {
        if (!confirm('Ste si istí, že chcete vymazať tento článok? Táto akcia je nevratná.')) {
            return;
        }

        try {
            // TODO: API call to delete article
            // await deleteArticle(articleId);

            setArticles(prev => prev.filter(article => article.id !== articleId));
        } catch (error) {
            console.error('Error deleting article:', error);
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
        return new Date(dateString).toLocaleDateString('sk-SK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="all-articles-loading">
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
                        <div className="all-articles__empty-icon">📚</div>
                        <h3>Žiadne články</h3>
                        <p>Podľa zadaných kritérií sa nenašli žiadne články.</p>
                    </div>
                ) : (
                    articles.map((article) => (
                        <div key={article.id} className="admin-article-card">
                            <div className="admin-article-card__header">
                                <div className="admin-article-card__status">
                                    <span className={`admin-article-card__status-badge ${getStatusColor(article.status)}`}>
                                        {getStatusLabel(article.status)}
                                    </span>
                                </div>
                                <div className="admin-article-card__author">
                                    Autor: {article.author.displayName}
                                </div>
                                <div className="admin-article-card__date">
                                    {formatDate(article.updatedAt)}
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

                                {article.moderationNote && (
                                    <div className="admin-article-card__moderation-note">
                                        <strong>Poznámka moderátora:</strong> {article.moderationNote}
                                    </div>
                                )}
                            </div>

                            <div className="admin-article-card__footer">
                                <div className="admin-article-card__stats">
                                    <span className="admin-article-card__stat">👁️ {article.views}</span>
                                    <span className="admin-article-card__stat">👍 {article.likes}</span>
                                    <span className="admin-article-card__stat">💬 {article.comments}</span>
                                </div>

                                <div className="admin-article-card__actions">
                                    {article.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(article.id, 'published')}
                                                className="admin-article-card__action-btn admin-article-card__approve-btn"
                                            >
                                                ✅ Schváliť
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const note = prompt('Dôvod zamietnutia (voliteľné):');
                                                    if (note !== null) {
                                                        handleStatusChange(article.id, 'rejected', note);
                                                    }
                                                }}
                                                className="admin-article-card__action-btn admin-article-card__reject-btn"
                                            >
                                                ❌ Zamietnuť
                                            </button>
                                        </>
                                    )}

                                    {article.status === 'published' && (
                                        <button
                                            onClick={() => handleStatusChange(article.id, 'draft')}
                                            className="admin-article-card__action-btn admin-article-card__unpublish-btn"
                                        >
                                            📥 Unpublikovať
                                        </button>
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
                                        onClick={() => handleDelete(article.id)}
                                        className="admin-article-card__action-btn admin-article-card__delete-btn"
                                    >
                                        🗑️ Vymazať
                                    </button>
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