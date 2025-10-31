"use client";

import { useState, useEffect } from "react";
import {
    getAllUsers,
    getUserStatistics,
    blockUser,
    unblockUser,
    changeUserRole,
    deleteUser
} from '@/actions/adminUsers.actions';
import "./UsersManagementPage.scss";

const UsersManagementPage = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
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
        loadStatistics();
    }, [filter, searchTerm]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            // Параметры для фильтрации
            const params = {
                page: 1,
                limit: 50
            };

            // Добавляем фильтры если они выбраны
            if (filter !== 'all') {
                if (filter === 'blocked') {
                    params.isBlocked = true;
                } else {
                    params.role = filter;
                }
            }

            // Добавляем поиск если есть
            if (searchTerm) {
                params.search = searchTerm;
            }

            const result = await getAllUsers(params);

            if (result.success) {
                // Обрабатываем разные форматы ответа
                const usersData = result.data.users || result.data || [];
                setUsers(usersData);
            } else {
                console.error('Error loading users:', result.message);
                alert(result.message || 'Chyba pri načítavaní používateľov');
            }

        } catch (error) {
            console.error('Error loading users:', error);
            alert('Chyba pri načítavaní používateľov');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const result = await getUserStatistics();

            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
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

        const userToChange = users.find(u => u.id === userId);
        if (!userToChange) return;

        if (!confirm(`Ste si istí, že chcete zmeniť rolu používateľa "${userToChange.displayName}" na "${getRoleLabel(newRole)}"?`)) {
            return;
        }

        try {
            const result = await changeUserRole(userId, { role: newRole });

            if (result.success) {
                // Обновляем локальное состояние
                setUsers(prev => prev.map(u =>
                    u.id === userId ? { ...u, role: newRole } : u
                ));

                // Перезагружаем статистику
                await loadStatistics();

                alert(result.message || 'Rola bola úspešne zmenená');
            } else {
                alert(result.message || 'Chyba pri zmene role používateľa');
            }
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
        const reason = shouldBlock ? prompt('Zadajte dôvod blokovania (minimálne 5 znakov):') : null;

        if (shouldBlock && (!reason || reason.trim().length < 5)) {
            alert('Dôvod blokovania musí obsahovať minimálne 5 znakov.');
            return;
        }

        if (!confirm(`Ste si istí, že chcete ${action} tohto používateľa?`)) {
            return;
        }

        try {
            let result;

            if (shouldBlock) {
                result = await blockUser(userId, { reason: reason.trim() });
            } else {
                result = await unblockUser(userId);
            }

            if (result.success) {
                // Обновляем локальное состояние
                setUsers(prev => prev.map(u =>
                    u.id === userId ? {
                        ...u,
                        isBlocked: shouldBlock,
                        blockReason: shouldBlock ? reason : null,
                        blockedUntil: shouldBlock ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null // 30 дней
                    } : u
                ));

                // Перезагружаем статистику
                await loadStatistics();

                alert(result.message || `Používateľ bol úspešne ${action}`);
            } else {
                alert(result.message || `Chyba pri ${action} používateľa`);
            }
        } catch (error) {
            console.error('Error updating user block status:', error);
            alert(`Chyba pri ${action} používateľa.`);
        }
    };

    const handleDeleteUser = async (userId) => {
        // Только admin может удалять пользователей
        if (user.role !== 'admin') {
            alert('Nemáte oprávnenie na mazanie používateľov.');
            return;
        }

        // Нельзя удалять самого себя
        if (userId === user.id) {
            alert('Nemôžete vymazať svoj vlastný účet.');
            return;
        }

        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) return;

        if (!confirm(`Ste si istí, že chcete natrvalo vymazať používateľa "${userToDelete.displayName}"?\n\nTáto akcia je nevratná!`)) {
            return;
        }

        try {
            const result = await deleteUser(userId);

            if (result.success) {
                // Удаляем пользователя из списка
                setUsers(prev => prev.filter(u => u.id !== userId));

                // Перезагружаем статистику
                await loadStatistics();

                alert(result.message || 'Používateľ bol úspešne vymazaný');
            } else {
                alert(result.message || 'Chyba pri mazaní používateľa');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Chyba pri mazaní používateľa.');
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
        if (!dateString) return 'Nikdy';

        return new Date(dateString).toLocaleDateString('sk-SK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActivityStatus = (lastLogin) => {
        if (!lastLogin) return 'Neaktívny';

        const lastLoginDate = new Date(lastLogin);
        const now = new Date();
        const diffDays = Math.floor((now - lastLoginDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Dnes';
        if (diffDays === 1) return 'Včera';
        if (diffDays < 7) return `Pred ${diffDays} dňami`;
        if (diffDays < 30) return `Pred ${Math.floor(diffDays / 7)} týždňami`;
        return `Pred ${Math.floor(diffDays / 30)} mesiacmi`;
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
                    <div className="users__stat-number">{stats.total || 0}</div>
                    <div className="users__stat-label">Celkovo používateľov</div>
                </div>
                <div className="users__stat-card">
                    <div className="users__stat-number">{stats.users || 0}</div>
                    <div className="users__stat-label">Používatelia</div>
                </div>
                <div className="users__stat-card">
                    <div className="users__stat-number">{stats.authors || 0}</div>
                    <div className="users__stat-label">Autori</div>
                </div>
                <div className="users__stat-card">
                    <div className="users__stat-number">{stats.admins || 0}</div>
                    <div className="users__stat-label">Admini</div>
                </div>
                <div className="users__stat-card">
                    <div className="users__stat-number">{stats.blocked || 0}</div>
                    <div className="users__stat-label">Blokovaní</div>
                </div>
                <div className="users__stat-card">
                    <div className="users__stat-number">{stats.newThisMonth || 0}</div>
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
                        Všetci ({stats.total || 0})
                    </button>
                    <button
                        onClick={() => setFilter('user')}
                        className={`users__filter-btn ${filter === 'user' ? 'active' : ''}`}
                    >
                        Používatelia ({stats.users || 0})
                    </button>
                    <button
                        onClick={() => setFilter('author')}
                        className={`users__filter-btn ${filter === 'author' ? 'active' : ''}`}
                    >
                        Autori ({stats.authors || 0})
                    </button>
                    <button
                        onClick={() => setFilter('admin')}
                        className={`users__filter-btn ${filter === 'admin' ? 'active' : ''}`}
                    >
                        Admini ({stats.admins || 0})
                    </button>
                    <button
                        onClick={() => setFilter('blocked')}
                        className={`users__filter-btn ${filter === 'blocked' ? 'active' : ''}`}
                    >
                        Blokovaní ({stats.blocked || 0})
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
                        <button
                            onClick={() => { setFilter('all'); setSearchTerm(''); }}
                            className="users__filter-btn"
                        >
                            Zobraziť všetkých používateľov
                        </button>
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
                                            onError={(e) => {
                                                e.target.src = "/icons/user-placeholder.svg";
                                            }}
                                        />
                                    </div>
                                    <div className="user-card__details">
                                        <h3 className="user-card__name">{userData.displayName || userData.email}</h3>
                                        <p className="user-card__email">{userData.email}</p>
                                        <div className="user-card__meta">
                                            <span className={`user-card__role-badge ${getRoleColor(userData.role)}`}>
                                                {getRoleLabel(userData.role)}
                                            </span>
                                            {userData.id === user.id && (
                                                <span className="user-card__current-user">(vy)</span>
                                            )}
                                            <span className="user-card__activity">
                                                {getActivityStatus(userData.lastLogin)}
                                            </span>
                                        </div>
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
                                    <span className="user-card__stat-value">{userData.articlesCount || 0}</span>
                                </div>
                                <div className="user-card__stat">
                                    <span className="user-card__stat-label">Komentáre:</span>
                                    <span className="user-card__stat-value">{userData.commentsCount || 0}</span>
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

                            {userData.isBlocked && userData.blockReason && (
                                <div className="user-card__block-info">
                                    <strong>Dôvod blokovania:</strong> {userData.blockReason}
                                    {userData.blockedUntil && (
                                        <span> (do {formatDate(userData.blockedUntil)})</span>
                                    )}
                                </div>
                            )}

                            <div className="user-card__actions">
                                {/* Role Change - только admin может менять роли других пользователей */}
                                {user.role === 'admin' && userData.id !== user.id && (
                                    <div className="user-card__role-select">
                                        <label>Rola:</label>
                                        <select
                                            value={userData.role}
                                            onChange={(e) => handleRoleChange(userData.id, e.target.value)}
                                            disabled={userData.isBlocked}
                                        >
                                            <option value="user">Používateľ</option>
                                            <option value="author">Autor</option>
                                            <option value="admin" disabled>Administrátor</option>
                                        </select>
                                    </div>
                                )}

                                {/* Показываем что свою роль нельзя менять */}
                                {user.role === 'admin' && userData.id === user.id && (
                                    <div className="user-card__role-info">
                                        <label>Rola:</label>
                                        <span className="user-card__current-role">
                                            {getRoleLabel(userData.role)} (vaša rola)
                                        </span>
                                    </div>
                                )}

                                <div className="user-card__action-buttons">
                                    {/* Block/Unblock - только admin может блокировать других пользователей */}
                                    {user.role === 'admin' && userData.id !== user.id && (
                                        <button
                                            onClick={() => handleBlockUser(userData.id, !userData.isBlocked)}
                                            className={`user-card__block-btn ${userData.isBlocked ? 'user-card__unblock-btn' : ''}`}
                                        >
                                            {userData.isBlocked ? '✅ Odblokovať' : '🚫 Blokovať'}
                                        </button>
                                    )}

                                    {/* Delete user - только admin может удалять других пользователей */}
                                    {user.role === 'admin' && userData.id !== user.id && (
                                        <button
                                            onClick={() => handleDeleteUser(userData.id)}
                                            className="user-card__delete-btn"
                                            title="Natrvalo vymazať používateľa"
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

export default UsersManagementPage;