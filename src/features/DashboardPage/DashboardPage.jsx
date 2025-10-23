"use client";

import { useState, useEffect } from "react";
import "./DashboardPage.scss";

const DashboardPage = ({ user }) => {
    const [stats, setStats] = useState({
        comments: 0,
        savedArticles: 0
    });

    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Загрузка статистики для USER роли
        const loadUserStats = async () => {
            try {
                // Пока используем моковые данные

                setStats({
                    comments: 12,
                    savedArticles: 5
                });

                setRecentActivity([
                    { title: "Nové úroky hypoték 2025", time: "pred 2h" },
                    { title: "Daňové zmeny od januára", time: "včera" },
                    { title: "Investície pre začiatočníkov", time: "pred 3 dní" },
                    { title: "Ako ušetriť na domácnosti", time: "pred týždňom" }
                ]);
            } catch (error) {
                console.error("Error loading user stats:", error);
            } finally {
                setLoading(false);
            }
        };

        loadUserStats();
    }, []);

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
                                Registrovaný: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('sk-SK') : "15.01.2025"}
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
                            <div className="dashboard__stat-label">Komentáre</div>
                        </div>
                        <div className="dashboard__stat-card">
                            <div className="dashboard__stat-number">{stats.savedArticles}</div>
                            <div className="dashboard__stat-label">Uložené</div>
                        </div>
                    </div>
                </div>

                {/* Quick Links Section */}
                <div className="dashboard__section">
                    <h2>RÝCHLE ODKAZY</h2>
                    <div className="dashboard__quick-links">
                        <a href="/profil/komentare" className="dashboard__quick-link">
                            💬 Moje komentáre
                        </a>
                        <a href="/profil/ulozene" className="dashboard__quick-link">
                            📚 Uložené články
                        </a>
                        <a href="/profil/nastavenia" className="dashboard__quick-link">
                            ⚙️ Nastavenia profilu
                        </a>
                    </div>
                </div>

                {/* Reading History Section */}
                <div className="dashboard__section">
                    <h2>HISTÓRIA ČÍTANIA</h2>
                    <div className="dashboard__activity">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((item, index) => (
                                <div key={index} className="dashboard__activity-item">
                                    <span className="dashboard__activity-title">{item.title}</span>
                                    <span className="dashboard__activity-time">({item.time})</span>
                                </div>
                            ))
                        ) : (
                            <p className="dashboard__no-activity">Zatiaľ žiadna aktivita</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;