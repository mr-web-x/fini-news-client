"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

    useEffect(() => {
        loadUserArticles();
    }, [filter]);

    const loadUserArticles = async () => {
        setLoading(true);
        try {
            // TODO: заменить на реальный API вызов
            // const result = await getUserArticles(user.id, filter);

            // Моковые данные
            const mockArticles = [
                {
                    id: 1,
                    title: "Ako investovať do kryptomien v roku 2025",
                    slug: "ako-investovat-kryptomeny-2025",
                    excerpt: "Kompletný sprievodca investovaním do kryptomien pre začiatočníkov...",
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
                    status: "draft",
                    views: 0,
                    likes: 0,
                    comments: 0,
                    createdAt: "2025-01-19T16:45:00Z",
                    updatedAt: "2025-01-19T18:30:00Z",
                    publishedAt: null
                }
            ];

            setArticles(mockArticles);

            // Kalkulácia štatistík
            const totalViews = mockArticles.reduce((sum, article) => sum + article.views, 0);
            setStats({
                total: mockArticles.length,
                draft: mockArticles.filter(a => a.status === 'draft').length,
                pending: mockArticles.filter(a => a.status === 'pending').length,
                published: mockArticles.filter(a => a.status === 'published').length,
                rejected: mockArticles.filter(a => a.status === 'rejected').length,
                totalViews
            });

        } catch (error) {
            console.error('Error loading articles:', error);
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
            // TODO: API call to delete article
            // await deleteArticle(articleId);

            setArticles(prev => prev.filter(article => article.id !== articleId));
        } catch (error) {
            console.error('Error deleting article:', error);
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
            </div>

            {/* Articles List */}
            <div className="articles__list">
                {filteredArticles.length === 0 ? (
                    <div className="articles__empty">
                        <div className="articles__empty-icon">📝</div>
                        <h3>Zatiaľ žiadne články</h3>
                        <p>Začnite písať svoj prvý článok a zdieľajte svoje myšlienky so svetom.</p>
                        <Link href="/profil/novy-clanok" className="articles__empty-btn">
                            Napísať prvý článok
                        </Link>
                    </div>
                ) : (
                    filteredArticles.map((article) => (
                        <div key={article.id} className="article-card">
                            <div className="article-card__header">
                                <div className="article-card__status">
                                    <span className={`article-card__status-badge ${getStatusColor(article.status)}`}>
                                        {getStatusLabel(article.status)}
                                    </span>
                                </div>
                                <div className="article-card__date">
                                    {formatDate(article.updatedAt)}
                                </div>
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
                            </div>

                            <div className="article-card__footer">
                                <div className="article-card__stats">
                                    <span className="article-card__stat">👁️ {article.views}</span>
                                    <span className="article-card__stat">👍 {article.likes}</span>
                                    <span className="article-card__stat">💬 {article.comments}</span>
                                </div>

                                <div className="article-card__actions">
                                    <Link
                                        href={`/profil/upravit-clanok/${article.id}`}
                                        className="article-card__action-btn article-card__edit-btn"
                                    >
                                        ✏️ Upraviť
                                    </Link>
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
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        className="article-card__action-btn article-card__delete-btn"
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

export default MyArticlesPage;