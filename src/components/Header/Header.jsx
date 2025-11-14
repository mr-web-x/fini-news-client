"use client";

import "./Header.scss";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import SearchDropdown from "@/components/SearchDropdown/SearchDropdown";
import { searchArticlesAction } from "@/actions/search.actions";

const Header = ({ user = null }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // === НОВОЕ: Состояния для поиска ===
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null); // Ref для клика вне области

    // Категории для dropdown
    const categories = [
        { name: "Banky", slug: "banky", icon: "🏦" },
        { name: "Úvery", slug: "uvery", icon: "💰" },
        { name: "Poistenie", slug: "poistenie", icon: "🛡️" },
        { name: "Dane", slug: "dane", icon: "📊" },
        { name: "Ekonomika", slug: "ekonomika", icon: "📈" }
    ];

    // Закрытие dropdown при клике вне его
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.header-dropdown')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Закрытие мобильного меню при смене роута
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // === НОВОЕ: Закрытие search dropdown при клике вне его ===
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // === НОВОЕ: Debounce поиск (500ms) ===
    useEffect(() => {
        // Если поле пустое - закрываем dropdown и очищаем результаты
        if (searchQuery.trim().length === 0) {
            setIsSearchOpen(false);
            setSearchResults([]);
            return;
        }

        // Минимум 2 символа для поиска
        if (searchQuery.trim().length < 2) {
            return;
        }

        // Debounce: ждём 500ms после последнего ввода
        const debounceTimer = setTimeout(async () => {
            setIsSearching(true);
            setIsSearchOpen(true);

            try {
                // Вызываем Server Action
                const result = await searchArticlesAction(searchQuery.trim());

                if (result.success) {
                    setSearchResults(result.data);
                } else {
                    setSearchResults([]);
                    console.error('Search error:', result.message);
                }
            } catch (error) {
                console.error('Search failed:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        // Cleanup: отменяем предыдущий таймер при новом вводе
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    // === НОВОЕ: Очистка поиска ===
    const handleClearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setIsSearchOpen(false);
    };

    // === НОВОЕ: Закрытие dropdown ===
    const handleCloseSearchDropdown = () => {
        setIsSearchOpen(false);
    };

    // Старый обработчик submit (для страницы /hladanie)
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/hladanie?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false); // Закрываем dropdown при переходе
        }
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header__wrapper">
                    {/* Logo */}
                    <Link href="/" className="header__logo">
                        <Image
                            alt="Fini.sk logo"
                            src="/icons/logo.svg"
                            width={36}
                            height={36}
                            priority
                        />
                        <span className="header__logo-text">Fini.sk</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="header__nav">
                        <Link
                            href="/"
                            className={`header__nav-link ${pathname === '/' ? 'header__nav-link--active' : ''}`}
                        >
                            Domov
                        </Link>

                        {/* Dropdown for Správy */}
                        <div className="header-dropdown">
                            <button
                                className={`header__nav-link header__nav-link--dropdown ${pathname.startsWith('/spravy') ? 'header__nav-link--active' : ''
                                    }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDropdownOpen(!isDropdownOpen);
                                }}
                            >
                                Správy
                                <span className={`header__dropdown-arrow ${isDropdownOpen ? 'header__dropdown-arrow--open' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {isDropdownOpen && (
                                <div className="header__dropdown-menu">
                                    <Link href="/spravy" className="header__dropdown-item header__dropdown-item--all">
                                        <span className="header__dropdown-icon">📰</span>
                                        <div>
                                            <div className="header__dropdown-title">Všetky správy</div>
                                            <div className="header__dropdown-desc">Všetky články na jednom mieste</div>
                                        </div>
                                    </Link>
                                    <div className="header__dropdown-divider"></div>
                                    {categories.map((category) => (
                                        <Link
                                            key={category.slug}
                                            href={`/spravy/${category.slug}`}
                                            className="header__dropdown-item"
                                        >
                                            <span className="header__dropdown-icon">{category.icon}</span>
                                            <span className="header__dropdown-title">{category.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/autori"
                            className={`header__nav-link ${pathname === '/autori' ? 'header__nav-link--active' : ''}`}
                        >
                            Autori
                        </Link>

                        <Link
                            href="/o-nas"
                            className={`header__nav-link ${pathname === '/o-nas' ? 'header__nav-link--active' : ''}`}
                        >
                            O nás
                        </Link>

                        <Link
                            href="https://fini.sk/kontakty.html"
                            className={`header__nav-link ${pathname === '/kontakt' ? 'header__nav-link--active' : ''}`}
                        >
                            Kontakt
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="header__actions">
                        {/* === НОВОЕ: Search Input с dropdown === */}
                        <div className="header__search-wrapper" ref={searchRef}>
                            <form onSubmit={handleSearch} className="header__search-form">
                                <div className="header__search-input-wrapper">
                                    <Search size={18} className="header__search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Hľadať..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="header__search-input"
                                    />
                                    {searchQuery.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="header__search-clear"
                                            aria-label="Vymazať"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </form>

                            {/* Search Dropdown */}
                            {isSearchOpen && (
                                <SearchDropdown
                                    results={searchResults}
                                    isLoading={isSearching}
                                    onClose={handleCloseSearchDropdown}
                                    query={searchQuery}
                                />
                            )}
                        </div>

                        {/* Auth Button / User Avatar */}
                        {user ? (
                            <Link href="/profil" className="header__user">
                                <img
                                    src={user.avatar || "/icons/user-placeholder.svg"}
                                    alt={user.displayName || "User"}
                                    className="header__user-avatar"
                                />
                                <span className="header__user-name">{user.displayName}</span>
                            </Link>
                        ) : (
                            <Link href="/prihlasenie" className="header__login-btn">
                                Prihlásiť sa
                            </Link>
                        )}

                        {/* Mobile Menu Button (Burger) */}
                        <button
                            className={`header__burger ${isMenuOpen ? 'header__burger--active' : ''}`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="header__mobile-menu">
                        <Link href="/" className="header__mobile-link">
                            Domov
                        </Link>
                        <Link href="/spravy" className="header__mobile-link">
                            Všetky správy
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.slug}
                                href={`/spravy/${category.slug}`}
                                className="header__mobile-link header__mobile-link--sub"
                            >
                                {category.icon} {category.name}
                            </Link>
                        ))}
                        <Link href="/autori" className="header__mobile-link">
                            Autori
                        </Link>
                        <Link href="/o-nas" className="header__mobile-link">
                            O nás
                        </Link>
                        <a href="https://fini.sk/kontakty.html" className="header__mobile-link">
                            Kontakt
                        </a>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;