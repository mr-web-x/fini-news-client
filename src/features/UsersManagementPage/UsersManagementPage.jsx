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
        active: 0
    });

    // ✅ Загрузка при монтировании и изменении фильтра
    useEffect(() => {
        loadUsers();
    }, [filter]);

    // ✅ Загрузка статистики при монтировании
    useEffect(() => {
        loadStatistics();
    }, []);

    // ✅ DEBOUNCE для поиска (как в компоненте статей)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm || searchTerm === '') {
                loadUsers();
            }
        }, 700); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const params = {
                page: 1,
                limit: 50
            };

            if (filter !== 'all') {
                if (filter === 'blocked') {
                    params.isBlocked = true;
                } else {
                    params.role = filter;
                }
            }

            if (searchTerm && searchTerm.trim()) {
                params.search = searchTerm.trim();
            }

            console.log('🔍 Поиск с параметрами:', params);

            const result = await getAllUsers(params);

            if (result.success) {
                const usersData = result.data.users || result.data || [];
                console.log('✅ Найдено пользователей:', usersData.length);
                setUsers(usersData);
            } else {
                console.error('❌ Error loading users:', result.message);
                // Не показываем alert при пустом результате поиска
                if (!searchTerm) {
                    alert(result.message || 'Chyba pri načítavaní používateľov');
                }
                setUsers([]);
            }

        } catch (error) {
            console.error('❌ Error loading users:', error);
            if (!searchTerm) {
                alert('Chyba pri načítavaní používateľov');
            }
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const result = await getUserStatistics();

            if (result.success) {
                const statsData = result.data;

                setStats({
                    total: statsData.total || 0,
                    users: statsData.roles?.user || 0,
                    authors: statsData.roles?.author || 0,
                    admins: statsData.roles?.admin || 0,
                    blocked: statsData.blocked || 0,
                    active: statsData.active || 0
                });
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (user.role !== 'admin') {
            alert('Nemáte oprávnenie na zmenu rolí používateľov.');
            return;
        }

        if (newRole !== 'user' && newRole !== 'author') {
            alert('Môžete meniť iba medzi rolami "Používateľ" a "Autor".');
            return;
        }

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
                setUsers(prev => prev.map(u =>
                    u.id === userId ? { ...u, role: newRole } : u
                ));

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
        if (user.role !== 'admin') {
            alert('Nemáte oprávnenie na blokovanie používateľov.');
            return;
        }

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
                setUsers(prev => prev.map(u =>
                    u.id === userId ? {
                        ...u,
                        isBlocked: {
                            status: shouldBlock,
                            reason: shouldBlock ? reason : null,
                            until: null,
                            blockedBy: shouldBlock ? user.id : null
                        }
                    } : u
                ));

                await loadStatistics();
                alert(result.message || `Používateľ bol úspešne ${shouldBlock ? 'zablokovaný' : 'odblokovaný'}`);
            } else {
                alert(result.message || `Chyba pri ${action} používateľa`);
            }
        } catch (error) {
            console.error('Error updating user block status:', error);
            alert(`Chyba pri ${action} používateľa.`);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (user.role !== 'admin') {
            alert('Nemáte oprávnenie na mazanie používateľov.');
            return;
        }

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
                setUsers(prev => prev.filter(u => u.id !== userId));
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
                    <div className="users__stat-number">{stats.admins}</div>
                    <div className="users__stat-label">Admini</div>
                </div>
                <div className="users__stat-card">
                    <div className="users__stat-number">{stats.blocked}</div>
                    <div className="users__stat-label">Blokovaní</div>
                </div>
                <div className="users__stat-card">
                    <div className="users__stat-number">{stats.active}</div>
                    <div className="users__stat-label">Aktívni</div>
                </div>
            </div>

            <div className="users__controls">
                <div className="users__search">
                    <input
                        type="text"
                        placeholder="🔍 Hľadať podľa mena alebo emailu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="users__search-input"
                    />
                    {searchTerm && (
                        <div className="users__search-info">
                            Hľadám: "{searchTerm}"
                        </div>
                    )}
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

            <div className="users__list">
                {users.length === 0 ? (
                    <div className="users__empty">
                        <div className="users__empty-icon">👥</div>
                        <h3>Žiadni používatelia</h3>
                        <p>
                            {searchTerm
                                ? `Pre vyhľadávanie "${searchTerm}" sa nenašli žiadni používatelia.`
                                : 'Podľa zadaných kritérií sa nenašli žiadni používatelia.'
                            }
                        </p>
                        {(searchTerm || filter !== 'all') && (
                            <button
                                onClick={() => { setFilter('all'); setSearchTerm(''); }}
                                className="users__filter-btn"
                            >
                                Zobraziť všetkých používateľov
                            </button>
                        )}
                    </div>
                ) : (
                    users.map((userData) => {
                        const isUserBlocked = userData.isBlocked?.status || false;

                        return (
                            <div key={userData.id} className={`user-card ${isUserBlocked ? 'user-card--blocked' : ''}`}>
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
                                                {isUserBlocked && (
                                                    <span className="user-card__blocked-badge">🚫 Blokovaný</span>
                                                )}
                                            </div>
                                            <div className="user-card__activity">
                                                {getActivityStatus(userData.lastLogin)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="user-card__stats">
                                    <div className="user-card__stat">
                                        <span className="user-card__stat-label">Registrácia:</span>
                                        <span className="user-card__stat-value">{formatDate(userData.createdAt)}</span>
                                    </div>
                                    <div className="user-card__stat">
                                        <span className="user-card__stat-label">Posledné prihlásenie:</span>
                                        <span className="user-card__stat-value">{formatDate(userData.lastLogin)}</span>
                                    </div>
                                </div>

                                {isUserBlocked && userData.isBlocked?.reason && (
                                    <div className="user-card__block-info">
                                        <strong>Dôvod blokovania:</strong> {userData.isBlocked.reason}
                                        {userData.isBlocked.until && (
                                            <span> (do {formatDate(userData.isBlocked.until)})</span>
                                        )}
                                    </div>
                                )}

                                <div className="user-card__actions">
                                    {user.role === 'admin' && userData.id !== user.id && userData.role !== 'admin' && (
                                        <div className="user-card__role-select">
                                            <label>Rola:</label>
                                            <select
                                                value={userData.role}
                                                onChange={(e) => handleRoleChange(userData.id, e.target.value)}
                                                disabled={isUserBlocked}
                                            >
                                                <option value="user">Používateľ</option>
                                                <option value="author">Autor</option>
                                                <option value="admin" disabled>Administrátor</option>
                                            </select>
                                        </div>
                                    )}

                                    {user.role === 'admin' && userData.id === user.id && (
                                        <div className="user-card__role-info">
                                            <label>Rola:</label>
                                            <span className="user-card__current-role">
                                                {getRoleLabel(userData.role)} (vaša rola)
                                            </span>
                                        </div>
                                    )}

                                    <div className="user-card__action-buttons">
                                        {user.role === 'admin' && userData.id !== user.id && userData.role !== 'admin' && (
                                            <button
                                                onClick={() => handleBlockUser(userData.id, !isUserBlocked)}
                                                className={`user-card__block-btn ${isUserBlocked ? 'user-card__unblock-btn' : ''}`}
                                            >
                                                {isUserBlocked ? '✅ Odblokovať' : '🚫 Blokovať'}
                                            </button>
                                        )}

                                        {user.role === 'admin' && userData.id !== user.id && userData.role !== 'admin' && (
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
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default UsersManagementPage;