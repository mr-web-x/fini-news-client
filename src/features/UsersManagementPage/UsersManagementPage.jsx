"use client";

import { useState, useEffect } from "react";
import "./UsersManagementPage.scss";

const UsersManagementPage = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, user, author, admin, blocked
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        users: 0,
        authors: 0,
        admins: 0,
        blocked: 0,
        newThisMonth: 0
    });

    useEffect(() => {
        loadUsers();
    }, [filter, searchTerm]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            // TODO: заменить на реальный API вызов
            // const result = await getAllUsers(filter, searchTerm);

            // Моковые данные
            const mockUsers = [
                {
                    id: 1,
                    displayName: "Ján Novák",
                    email: "jan.novak@gmail.com",
                    role: "user",
                    avatar: null,
                    createdAt: "2025-01-15T10:30:00Z",
                    lastLogin: "2025-01-20T14:20:00Z",
                    articlesCount: 0,
                    commentsCount: 12,
                    isBlocked: false
                },
                {
                    id: 2,
                    displayName: "Mária Svobodová",
                    email: "maria.svobodova@gmail.com",
                    role: "author",
                    avatar: null,
                    createdAt: "2024-12-20T09:15:00Z",
                    lastLogin: "2025-01-19T16:45:00Z",
                    articlesCount: 8,
                    commentsCount: 24,
                    isBlocked: false
                },
                {
                    id: 3,
                    displayName: "Peter Kováč",
                    email: "peter.kovac@gmail.com",
                    role: "admin",
                    avatar: null,
                    createdAt: "2024-11-10T12:00:00Z",
                    lastLogin: "2025-01-20T18:30:00Z",
                    articlesCount: 15,
                    commentsCount: 45,
                    isBlocked: false
                },
                {
                    id: 4,
                    displayName: "Anna Horváthová",
                    email: "anna.horvathova@gmail.com",
                    role: "user",
                    avatar: null,
                    createdAt: "2025-01-18T16:45:00Z",
                    lastLogin: "2025-01-20T10:15:00Z",
                    articlesCount: 0,
                    commentsCount: 3,
                    isBlocked: true
                }
            ];

            // Фильтруем пользователей
            let filteredUsers = mockUsers;
            if (filter !== 'all') {
                if (filter === 'blocked') {
                    filteredUsers = mockUsers.filter(u => u.isBlocked);
                } else {
                    filteredUsers = mockUsers.filter(u => u.role === filter && !u.isBlocked);
                }
            }

            // Поиск по имени/email
            if (searchTerm) {
                filteredUsers = filteredUsers.filter(u =>
                    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            setUsers(filteredUsers);

            // Калkulácia štatistík
            setStats({
                total: mockUsers.length,
                users: mockUsers.filter(u => u.role === 'user').length,
                authors: mockUsers.filter(u => u.role === 'author').length,
                admins: mockUsers.filter(u => u.role === 'admin').length,
                blocked: mockUsers.filter(u => u.isBlocked).length,
                newThisMonth: mockUsers.filter(u => {
                    const created = new Date(u.createdAt);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length
            });

        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        // Только admin может менять роли
        if (user.role !== 'admin') {
            alert('Nemáte oprávnenie na zmenu rolí používateľov.');
            return;
        }

        // Можно менять только между user и author
        if (newRole !== 'user' && newRole !== 'author') {
            alert('Môžete meniť iba medzi rolami "Používateľ" a "Autor".');
            return;
        }

        // Нельзя менять роль самому себе
        if (userId === user.id) {
            alert('Nemôžete zmeniť svoju vlastnú rolu.');
            return;
        }

        if (!confirm(`Ste si istí, že chcete zmeniť rolu tohto používateľa na "${getRoleLabel(newRole)}"?`)) {
            return;
        }

        try {
            // TODO: API call to change user role
            // await updateUserRole(userId, newRole);

            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ));
        } catch (error) {
            console.error('Error changing user role:', error);
            alert('Chyba pri zmene role používateľa.');
        }
    };

    const handleBlockUser = async (userId, shouldBlock) => {
        // Только admin может блокировать пользователей
        if (user.role !== 'admin') {
            alert('Nemáte oprávnenie na blokovanie používateľov.');
            return;
        }

        // Нельзя блокировать самого себя
        if (userId === user.id) {
            alert('Nemôžete zablokovať seba.');
            return;
        }

        const action = shouldBlock ? 'zablokovať' : 'odblokovať';
        if (!confirm(`Ste si istí, že chcete ${action} tohto používateľa?`)) {
            return;
        }

        try {
            // TODO: API call to block/unblock user
            // await updateUserBlockStatus(userId, shouldBlock);

            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, isBlocked: shouldBlock } : u
            ));
        } catch (error) {
            console.error('Error updating user block status:', error);
            alert('Chyba pri zmene stavu blokovania.');
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'user': return 'Používateľ';
            case 'author': return 'Autor';
            case 'admin': return 'Administrátor';
            default: return role;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'user': return 'role--user';
            case 'author': return 'role--author';
            case 'admin': return 'role--admin';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('sk-SK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="users-loading">
                <div className="spinner"></div>
                <p>Načítavam používateľov...</p>
            </div>
        );
    }

    return (
        <div className="users-management-page">
            <div className="users__header">
                <h1>Správa používateľov</h1>
                <p>Spravujte používateľov, ich role a oprávnenia</p>
            </div>

            {/* Statistics */}
            <div className="users__stats">
                <div className="users__stat-card">
                    <div className="users__stat-number">{stats.total}</div>
                    <div className="users__stat-label">Celkovo používateľov</div>
                </div>
                <div className="users__stat-card">
                    <div className="users__stat-number">{stats.users}</div>
                    <div className="users__stat-label">Používatelia</div>
                </div>
                <div className="users__stat-card">
                    <div className="users__stat-number">{stats.authors}</div>
                    <div className="users__stat-label">Autori</div>
                </div>
                <div className="users__stat-card">
                    <div className="users__stat-number">{stats.newThisMonth}</div>
                    <div className="users__stat-label">Noví tento mesiac</div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="users__controls">
                <div className="users__search">
                    <input
                        type="text"
                        placeholder="Hľadať podľa mena alebo emailu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="users__search-input"
                    />
                </div>

                <div className="users__filters">
                    <button
                        onClick={() => setFilter('all')}
                        className={`users__filter-btn ${filter === 'all' ? 'active' : ''}`}
                    >
                        Všetci ({stats.total})
                    </button>
                    <button
                        onClick={() => setFilter('user')}
                        className={`users__filter-btn ${filter === 'user' ? 'active' : ''}`}
                    >
                        Používatelia ({stats.users})
                    </button>
                    <button
                        onClick={() => setFilter('author')}
                        className={`users__filter-btn ${filter === 'author' ? 'active' : ''}`}
                    >
                        Autori ({stats.authors})
                    </button>
                    <button
                        onClick={() => setFilter('admin')}
                        className={`users__filter-btn ${filter === 'admin' ? 'active' : ''}`}
                    >
                        Admini ({stats.admins})
                    </button>
                    <button
                        onClick={() => setFilter('blocked')}
                        className={`users__filter-btn ${filter === 'blocked' ? 'active' : ''}`}
                    >
                        Blokovaní ({stats.blocked})
                    </button>
                </div>
            </div>

            {/* Users List */}
            <div className="users__list">
                {users.length === 0 ? (
                    <div className="users__empty">
                        <div className="users__empty-icon">👥</div>
                        <h3>Žiadni používatelia</h3>
                        <p>Podľa zadaných kritérií sa nenašli žiadni používatelia.</p>
                    </div>
                ) : (
                    users.map((userData) => (
                        <div key={userData.id} className={`user-card ${userData.isBlocked ? 'user-card--blocked' : ''}`}>
                            <div className="user-card__header">
                                <div className="user-card__info">
                                    <div className="user-card__avatar">
                                        <img
                                            src={userData.avatar || "/icons/user-placeholder.svg"}
                                            alt="User avatar"
                                        />
                                    </div>
                                    <div className="user-card__details">
                                        <h3 className="user-card__name">{userData.displayName}</h3>
                                        <p className="user-card__email">{userData.email}</p>
                                        <span className={`user-card__role-badge ${getRoleColor(userData.role)}`}>
                                            {getRoleLabel(userData.role)}
                                        </span>
                                    </div>
                                </div>

                                <div className="user-card__status">
                                    {userData.isBlocked && (
                                        <span className="user-card__blocked-badge">🚫 Blokovaný</span>
                                    )}
                                </div>
                            </div>

                            <div className="user-card__stats">
                                <div className="user-card__stat">
                                    <span className="user-card__stat-label">Články:</span>
                                    <span className="user-card__stat-value">{userData.articlesCount}</span>
                                </div>
                                <div className="user-card__stat">
                                    <span className="user-card__stat-label">Komentáre:</span>
                                    <span className="user-card__stat-value">{userData.commentsCount}</span>
                                </div>
                                <div className="user-card__stat">
                                    <span className="user-card__stat-label">Registrovaný:</span>
                                    <span className="user-card__stat-value">{formatDate(userData.createdAt)}</span>
                                </div>
                                <div className="user-card__stat">
                                    <span className="user-card__stat-label">Posledné prihlásenie:</span>
                                    <span className="user-card__stat-value">{formatDate(userData.lastLogin)}</span>
                                </div>
                            </div>

                            <div className="user-card__actions">
                                {/* Role Change - только admin может менять роли */}
                                {user.role === 'admin' && userData.id !== user.id && (
                                    <div className="user-card__role-select">
                                        <label>Rola:</label>
                                        <select
                                            value={userData.role}
                                            onChange={(e) => handleRoleChange(userData.id, e.target.value)}
                                        >
                                            <option value="user">Používateľ</option>
                                            <option value="author">Autor</option>
                                            {/* Admin роль нельзя назначать */}
                                        </select>
                                    </div>
                                )}

                                {/* Block/Unblock - только admin может блокировать */}
                                {user.role === 'admin' && userData.id !== user.id && (
                                    <button
                                        onClick={() => handleBlockUser(userData.id, !userData.isBlocked)}
                                        className={`user-card__block-btn ${userData.isBlocked ? 'user-card__unblock-btn' : ''}`}
                                    >
                                        {userData.isBlocked ? '✅ Odblokovať' : '🚫 Blokovať'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UsersManagementPage;