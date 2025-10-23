"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./PrivateLayout.scss";

const PrivateLayout = ({ children, user }) => {
    const pathname = usePathname();
    const [currentUser, setCurrentUser] = useState(user);

    useEffect(() => {
        setCurrentUser(user);
    }, [user]);

    // Навигация в зависимости от роли
    const getNavigationItems = () => {
        const baseItems = [
            {
                href: "/profil",
                label: "Dashboard",
                icon: "🏠",
                roles: ["user", "author", "admin"]
            },
            {
                href: "/profil/nastavenia",
                label: "Nastavenia profilu",
                icon: "⚙️",
                roles: ["user", "author", "admin"]
            }
        ];

        const userItems = [
            {
                href: "/profil/komentare",
                label: "Moje komentáre",
                icon: "💬",
                roles: ["user", "author", "admin"]
            }
        ];

        const authorItems = [
            {
                href: "/profil/moje-clanky",
                label: "Moje články",
                icon: "📝",
                roles: ["author", "admin"]
            },
            {
                href: "/profil/novy-clanok",
                label: "Nový článok",
                icon: "➕",
                roles: ["author", "admin"]
            }
        ];

        const adminItems = [
            {
                href: "/profil/pouzivatelia",
                label: "Správa používateľov",
                icon: "👥",
                roles: ["admin"]
            },
            {
                href: "/profil/vsetky-clanky",
                label: "Všetky články",
                icon: "📚",
                roles: ["admin"]
            }
        ];

        const allItems = [...baseItems, ...userItems, ...authorItems, ...adminItems];

        // Фильтруем по роли пользователя
        return allItems.filter(item =>
            item.roles.includes(currentUser?.role || "user")
        );
    };

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });

            if (response.ok) {
                window.location.href = "/prihlasenie";
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case "user": return "Používateľ";
            case "author": return "Autor";
            case "admin": return "Administrátor";
            default: return "Používateľ";
        }
    };

    const navigationItems = getNavigationItems();

    return (
        <div className="private-layout">
            {/* Stacionárna sidebar */}
            <aside className="private-layout__sidebar">
                {/* Header sidebar */}
                <div className="sidebar__header">
                    <Link href="/" className="sidebar__logo">
                        <span className="sidebar__logo-icon">📰</span>
                        <span className="sidebar__logo-text">Fini.sk</span>
                    </Link>
                </div>

                {/* User info */}
                <div className="sidebar__user">
                    <div className="sidebar__user-avatar">
                        <img
                            src={currentUser?.avatar || "/icons/user-placeholder.svg"}
                            alt="User avatar"
                        />
                    </div>
                    <div className="sidebar__user-info">
                        <h3 className="sidebar__user-name">
                            {currentUser?.displayName || "Používateľ"}
                        </h3>
                        <p className="sidebar__user-role">
                            {getRoleLabel(currentUser?.role)}
                        </p>
                    </div>
                </div>

                {/* Navigation menu */}
                <nav className="sidebar__nav">
                    <ul className="sidebar__nav-list">
                        {navigationItems.map((item) => (
                            <li key={item.href} className="sidebar__nav-item">
                                <Link
                                    href={item.href}
                                    className={`sidebar__nav-link ${pathname === item.href ? "sidebar__nav-link--active" : ""
                                        }`}
                                >
                                    <span className="sidebar__nav-icon">{item.icon}</span>
                                    <span className="sidebar__nav-text">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout button */}
                <div className="sidebar__footer">
                    <button
                        onClick={handleLogout}
                        className="sidebar__logout-btn"
                    >
                        <span className="sidebar__nav-icon">🚪</span>
                        <span className="sidebar__nav-text">Odhlásiť sa</span>
                    </button>
                </div>
            </aside>

            {/* Main content area */}
            <main className="private-layout__content">
                {children}
            </main>
        </div>
    );
};

export default PrivateLayout;