"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserCommentsStats } from "@/actions/comments.actions";
import { getDashboardStats } from "@/actions/dashboard.actions";
import "./DashboardPage.scss";

const DashboardPage = ({ user }) => {
    const [stats, setStats] = useState({
        comments: 0,
        publishedArticles: 0
    });

    const [recentArticles, setRecentArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Загружаем статистику комментариев с учетом роли
            const commentsResult = await getUserCommentsStats(user?.role);

            // Загружаем статистику статей и последние 5 статей
            const articlesResult = await getDashboardStats();

            if (commentsResult.success && articlesResult.success) {
                setStats({
                    comments: commentsResult.data.totalComments || 0,
                    publishedArticles: articlesResult.data.publishedCount || 0
                });

                setRecentArticles(articlesResult.data.recentArticles || []);
            }
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Функция для форматирования даты на словацком
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        if (diffHours < 1) {
            return "pred chvíľou";
        } else if (diffHours < 24) {
            return `pred ${diffHours}h`;
        } else if (diffDays === 1) {
            return "včera";
        } else if (diffDays < 7) {
            return `pred ${diffDays} dní`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `pred ${weeks} týždňom${weeks > 1 ? 'i' : ''}`;
        } else {
            return date.toLocaleDateString('sk-SK');
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Načítavam dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-user">
                {/* User Welcome Section */}
                <div className="dashboard__welcome">
                    <div className="dashboard__user-info">
                        <div className="dashboard__user-avatar">
                            <img
                                src={user?.avatar || "/icons/user-placeholder.svg"}
                                alt="User avatar"
                            />
                        </div>
                        <div className="dashboard__user-details">
                            <h1 className="dashboard__user-name">
                                {user?.displayName || "Používateľ"}
                            </h1>
                            <p className="dashboard__user-email">{user?.email}</p>
                            <p className="dashboard__user-role">Používateľ</p>
                            <p className="dashboard__user-date">
                                Registrovaný: {user?.createdAt ?
                                    new Date(user.createdAt).toLocaleDateString('sk-SK') : "15.01.2025"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="dashboard__section">
                    <h2>ŠTATISTIKY</h2>
                    <div className="dashboard__stats">
                        <div className="dashboard__stat-card">
                            <div className="dashboard__stat-number">{stats.comments}</div>
                            <div className="dashboard__stat-label">
                                {user?.role === 'admin' ? 'Všetky komentáre' : 'Moje komentáre'}
                            </div>
                        </div>
                        <div className="dashboard__stat-card">
                            <div className="dashboard__stat-number">{stats.publishedArticles}</div>
                            <div className="dashboard__stat-label">Publikované články</div>
                        </div>
                    </div>
                </div>

                {/* Quick Links Section */}
                <div className="dashboard__section">
                    <h2>RÝCHLE ODKAZY</h2>
                    <div className="dashboard__quick-links">
                        <Link href="/profil/komentare" className="dashboard__quick-link">
                            💬 Moje komentáre
                        </Link>
                        <Link href="/profil/moje-clanky" className="dashboard__quick-link">
                            📝 Moje články
                        </Link>
                        <Link href="/profil/nastavenia" className="dashboard__quick-link">
                            ⚙️ Nastavenia profilu
                        </Link>
                    </div>
                </div>

                {/* Recent Articles Section */}
                <div className="dashboard__section">
                    <h2>POSLEDNÉ PUBLIKOVANÉ ČLÁNKY</h2>
                    <div className="dashboard__activity">
                        {recentArticles.length > 0 ? (
                            recentArticles.map((article) => (
                                <Link
                                    key={article._id}
                                    href={`/clanky/${article.slug}`}
                                    className="dashboard__activity-item"
                                >
                                    <span className="dashboard__activity-title">{article.title}</span>
                                    <span className="dashboard__activity-time">
                                        ({formatDate(article.createdAt)})
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <p className="dashboard__no-activity">Zatiaľ žiadne publikované články</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;