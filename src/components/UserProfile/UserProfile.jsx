"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./UserProfile.scss";

const UserProfile = ({ user, onLogout }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const pathname = usePathname();

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

    // Определяем навигацию в зависимости от роли
    const getNavItems = () => {
        const baseItems = [
            { href: '/profil', label: 'Dashboard', icon: '📊' },
            { href: '/profil/nastavenia', label: 'Nastavenia', icon: '⚙️' },
            { href: '/profil/komentare', label: 'Komentáre', icon: '💬' },
        ];

        if (user.role === 'author' || user.role === 'admin') {
            baseItems.splice(2, 0, // Вставляем после Settings
                { href: '/profil/novy-clanok', label: 'Nový článok', icon: '➕' },
                { href: '/profil/moje-clanky', label: 'Moje články', icon: '📝' }
            );
        }

        if (user.role === 'admin') {
            baseItems.push(
                { href: '/profil/vsetky-clanky', label: 'Všetky články', icon: '📚' },
                { href: '/profil/pouzivatelia', label: 'Používatelia', icon: '👥' }
            );
        }

        return baseItems;
    };

    const navItems = getNavItems();

    const handleLogout = () => {
        setIsDropdownOpen(false);
        onLogout();
    };

    return (
        <div className="user-profile">
            {/* Profile Button */}
            <button
                className="user-profile__trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <div className="user-profile__avatar">
                    <img
                        src={user.avatar || "/icons/user-placeholder.svg"}
                        alt="User avatar"
                    />
                </div>
                <div className="user-profile__info">
                    <span className="user-profile__name">{user.displayName}</span>
                    <span className={`user-profile__role ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                    </span>
                </div>
                <span className={`user-profile__arrow ${isDropdownOpen ? 'open' : ''}`}>
                    ▼
                </span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <>
                    <div
                        className="user-profile__overlay"
                        onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="user-profile__dropdown">
                        <div className="user-profile__dropdown-header">
                            <div className="user-profile__dropdown-avatar">
                                <img
                                    src={user.avatar || "/icons/user-placeholder.svg"}
                                    alt="User avatar"
                                />
                            </div>
                            <div className="user-profile__dropdown-info">
                                <h4>{user.displayName}</h4>
                                <p>{user.email}</p>
                                <span className={`user-profile__dropdown-role ${getRoleColor(user.role)}`}>
                                    {getRoleLabel(user.role)}
                                </span>
                            </div>
                        </div>

                        <nav className="user-profile__nav">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`user-profile__nav-item ${pathname === item.href ? 'active' : ''}`}
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <span className="user-profile__nav-icon">{item.icon}</span>
                                    <span className="user-profile__nav-label">{item.label}</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="user-profile__actions">
                            <button
                                onClick={handleLogout}
                                className="user-profile__logout"
                            >
                                <span className="user-profile__nav-icon">🚪</span>
                                <span className="user-profile__nav-label">Odhlásiť sa</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserProfile;