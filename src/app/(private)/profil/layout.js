"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/store/useAuthStore';
import { getMe, logout } from '@/actions/auth.actions';
import './profil.module.scss';

export default function PrivateLayout({ children }) {
    const router = useRouter();
    const { user, setUser, clearUser, isLoading, setLoading } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        // Загрузка данных пользователя при монтировании
        async function loadUser() {
            setLoading(true);
            const userData = await getMe();

            if (!userData) {
                // Если не авторизован - редирект на логин
                router.push('/prihlasenie');
                return;
            }

            setUser(userData);
        }

        loadUser();
    }, []);

    const handleLogout = async () => {
        await logout();
        clearUser();
        router.push('/prihlasenie');
    };

    if (isLoading) {
        return (
            <div className="private-layout-loading">
                <div className="spinner"></div>
                <p>Načítavam...</p>
            </div>
        );
    }

    if (!user) {
        return null; // Редирект происходит в useEffect
    }

    // Определяем навигацию в зависимости от роли
    const getNavItems = () => {
        const baseItems = [
            { href: '/profil', label: 'Dashboard', icon: '📊' },
            { href: '/profil/nastavenia', label: 'Nastavenia', icon: '⚙️' },
        ];

        if (user.role === 'author' || user.role === 'admin') {
            baseItems.push(
                { href: '/profil/novy-clanok', label: 'Nový článok', icon: '➕' },
                { href: '/profil/moje-clanky', label: 'Moje články', icon: '📝' }
            );
        }

        if (user.role === 'admin') {
            baseItems.push(
                { href: '/profil/vsetky-clanky', label: 'Všetky články', icon: '📚' },
                { href: '/profil/pouzivatelia', label: 'Používatelia', icon: '👥' },
                { href: '/profil/komentare', label: 'Komentáre', icon: '💬' }
            );
        }

        return baseItems;
    };

    const navItems = getNavItems();

    return (
        <div className="private-layout">
            {/* Sidebar */}
            <aside className={`private-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <Link href="/" className="logo">
                        <img src="/icons/logo.svg" alt="Fini.sk" />
                        <span>Fini.sk</span>
                    </Link>
                </div>

                {/* User info */}
                <div className="sidebar-user">
                    <img
                        src={user.avatar || '/images/placeholder.jpg'}
                        alt={user.displayName}
                        className="user-avatar"
                    />
                    <div className="user-info">
                        <p className="user-name">{user.displayName}</p>
                        <p className="user-role">{getRoleLabel(user.role)}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="nav-item"
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Logout button */}
                <button onClick={handleLogout} className="sidebar-logout">
                    <span className="nav-icon">🚪</span>
                    <span className="nav-label">Odhlásiť sa</span>
                </button>

                {/* Toggle button */}
                <button
                    className="sidebar-toggle"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? '◀' : '▶'}
                </button>
            </aside>

            {/* Main content */}
            <main className="private-main">
                <div className="private-content">
                    {children}
                </div>
            </main>
        </div>
    );
}

function getRoleLabel(role) {
    switch (role) {
        case 'user': return 'Používateľ';
        case 'author': return 'Autor';
        case 'admin': return 'Administrátor';
        default: return role;
    }
}