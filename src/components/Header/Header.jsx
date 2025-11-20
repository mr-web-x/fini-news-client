'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import AuthButton from '../AuthButton/AuthButton';
import SearchDropdown from '../SearchDropdown/SearchDropdown';
import { searchArticlesAction } from '@/actions/search.actions';
import './Header.scss';

export default function Header({ user = null }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const searchRef = useRef(null);

  // Категории для dropdown
  const categories = [
    { name: "Banky", slug: "banky" },
    { name: "Úvery", slug: "uvery" },
    { name: "Poistenie", slug: "poistenie" },
    { name: "Dane", slug: "dane" },
    { name: "Ekonomika", slug: "ekonomika" }
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);

    // Добавляем/убираем класс на body для блокировки скролла
    if (!isMobileMenuOpen) {
      document.body.classList.add('active-modal');
    } else {
      document.body.classList.remove('active-modal');
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.classList.remove('active-modal');
  };

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

  return (
    <header id="home">
      <div className="row">
        <div className="header__logo">
          <Link href="/" className="logo">
            <img src="/icons/logo.svg" alt="logo" />
            <span>Fini</span>
          </Link>
        </div>

        <nav className={`header__menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link href="https://fini.sk/" onClick={closeMobileMenu}>Domov</Link>
          <Link href="https://fini.sk/" onClick={closeMobileMenu}>Časté otázky</Link>
          <Link href="https://fini.sk/kontakty.html" onClick={closeMobileMenu}>Kontakt</Link>
          <Link href="https://fini.sk/#cc-credit-calculator" onClick={closeMobileMenu}>Požiadať o pôžičku</Link>
          <Link href="https://fastcredit.sk/forum/" target="_blank" rel="noopener noreferrer">
            FastCredit Forum
          </Link>

          {/* Dropdown для категорий */}
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
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/spravy?category=${category.slug}`}
                    className="header__dropdown-item"
                    onClick={closeMobileMenu}
                  >
                    <span className="header__dropdown-title">{category.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Search + Auth Button в одном блоке */}
        <div className="header__search-auth-block">
          {/* Search */}
          <div className="header__search-wrapper" ref={searchRef}>
            <div className="header__search-input-wrapper">
              <Search size={12} className="header__search-icon" />
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
                  <X size={10} />
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


        <div className="header__mobile-nav">
          <div
            className={`burger ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          >
            <figure></figure>
            <figure></figure>
            <figure></figure>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="header__mobile-menu active">
          <Link href="/#home" onClick={closeMobileMenu}>
            Domov
          </Link>
          <Link href="/caste-otazky" onClick={closeMobileMenu}>
            Časté otázky
          </Link>
          <Link href="/kontakty" onClick={closeMobileMenu}>
            Kontakt
          </Link>
          <Link href="/#cc-credit-calculator" onClick={closeMobileMenu}>
            Požiadať o pôžičku
          </Link>
          <a href="https://fastcredit.sk/forum/" target="_blank" rel="noopener noreferrer">
            FastCredit Forum
          </a>
          <Link href="/spravy" onClick={closeMobileMenu}>
            Správy
          </Link>
        </div>
      )}
    </header>
  );
}