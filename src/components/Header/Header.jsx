"use client";

import "./Header.scss";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import SearchDropdown from "@/components/SearchDropdown/SearchDropdown";
import { searchArticlesAction } from "@/actions/search.actions";
import AuthButton from "../AuthButton/AuthButton";

const Header = ({ user = null }) => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);

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

    // Закрытие search dropdown при клике вне его
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounce поиск (500ms)
    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            setIsSearchOpen(false);
            setSearchResults([]);
            return;
        }

        if (searchQuery.trim().length < 2) {
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setIsSearching(true);
            setIsSearchOpen(true);

            try {
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

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    // Очистка поиска
    const handleClearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setIsSearchOpen(false);
    };

    // Закрытие dropdown
    const handleCloseSearchDropdown = () => {
        setIsSearchOpen(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
    };

    return (
        <header className="header">
            <div className="row">
                {/* Logo - слева */}
                <div className="header__logo">
                    <Link href="/" className="logo">
                        <Image
                            alt="Fini.sk logo"
                            src="/icons/logo.svg"
                            width={18}
                            height={18}
                            priority
                        />
                        <span>Fini.sk</span>
                    </Link>
                </div>

                {/* Desktop Navigation - справа */}
                <nav className="header__menu">
                    <Link
                        href="/"
                        className={pathname === '/' ? 'active' : ''}
                    >
                        Domov
                    </Link>

                    {/* Dropdown для Správy */}
                    <div className="header-dropdown">
                        <button
                            className={`header__dropdown-btn ${pathname.startsWith('/spravy') ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDropdownOpen(!isDropdownOpen);
                            }}
                        >
                            Správy
                            <span className={`header__dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
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
                                        href={`/spravy?category=${category.slug}`}
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
                        className={pathname === '/autori' ? 'active' : ''}
                    >
                        Autori
                    </Link>

                    <Link
                        href="/o-nas"
                        className={pathname === '/o-nas' ? 'active' : ''}
                    >
                        O nás
                    </Link>

                    <Link href="https://fini.sk/kontakty.html">
                        Kontakt
                    </Link>

                    {/* Search + Auth в одной ячейке */}
                    <div className="header__actions-container">
                        {/* Search */}
                        <div className="header__search-wrapper" ref={searchRef}>
                            <div className="header__search-input-wrapper">
                                <Search size={16} className="header__search-icon" />
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
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

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

                        {/* Auth Button */}
                        <AuthButton user={user} />
                    </div>
                </nav>

                {/* Mobile Navigation - справа */}
                <div className="header__mobile-nav">
                    <div
                        className={`burger ${isMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <figure></figure>
                        <figure></figure>
                        <figure></figure>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="header__mobile-menu active">
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>
                        Domov
                    </Link>
                    <Link href="/spravy" onClick={() => setIsMenuOpen(false)}>
                        Všetky správy
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category.slug}
                            href={`/spravy?category=${category.slug}`}
                            className="submenu-item"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {category.icon} {category.name}
                        </Link>
                    ))}
                    <Link href="/autori" onClick={() => setIsMenuOpen(false)}>
                        Autori
                    </Link>
                    <Link href="/o-nas" onClick={() => setIsMenuOpen(false)}>
                        O nás
                    </Link>
                    <a href="https://fini.sk/kontakty.html">
                        Kontakt
                    </a>
                </div>
            )}
        </header>
    );
};

export default Header;