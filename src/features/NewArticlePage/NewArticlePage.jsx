"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createArticle } from "@/actions/articles.actions";
import { getAllCategories, createCategory } from "@/actions/categories.actions";
import "./NewArticlePage.scss";

const NewArticlePage = ({ user }) => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: '',
        tags: '',
        featuredImage: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [imagePreview, setImagePreview] = useState(null);

    // Состояние для категорий
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Состояние для создания новой категории (только для admin)
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [categoryMessage, setCategoryMessage] = useState({ type: '', text: '' });

    // Загрузка категорий при монтировании компонента
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoadingCategories(true);
        try {
            const result = await getAllCategories();

            if (result.success) {
                // Проверяем разные варианты структуры ответа
                let categoriesData = [];

                if (Array.isArray(result.data)) {
                    categoriesData = result.data;
                } else if (result.data?.data && Array.isArray(result.data.data)) {
                    categoriesData = result.data.data;
                } else if (result.data?.categories && Array.isArray(result.data.categories)) {
                    categoriesData = result.data.categories;
                }

                setCategories(categoriesData);
                console.log('Loaded categories:', categoriesData);
            } else {
                console.error('Error loading categories:', result.message);
                setCategories([]);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            setCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Автогенерация slug при изменении заголовка
        if (name === 'title') {
            const autoSlug = generateSlug(value);
            setFormData(prev => ({
                ...prev,
                title: value,
                slug: autoSlug
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Генерация slug из заголовка
    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    // Обработка загрузки изображения
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Проверка размера файла (макс 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setMessage({
                    type: 'error',
                    text: 'Súbor je príliš veľký. Maximálna veľkosť je 5MB.'
                });
                return;
            }

            // Проверка типа файла
            if (!file.type.startsWith('image/')) {
                setMessage({
                    type: 'error',
                    text: 'Nahrajte prosím obrázok (JPG, PNG, GIF, WebP).'
                });
                return;
            }

            // Создаем превью
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData(prev => ({
                    ...prev,
                    featuredImage: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setFormData(prev => ({
            ...prev,
            featuredImage: ''
        }));
    };

    // Обработка создания новой категории (только admin)
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            setCategoryMessage({
                type: 'error',
                text: 'Zadajte názov kategórie'
            });
            return;
        }

        if (newCategoryName.trim().length < 2) {
            setCategoryMessage({
                type: 'error',
                text: 'Názov kategórie musí obsahovať minimálne 2 znaky'
            });
            return;
        }

        setCreatingCategory(true);
        setCategoryMessage({ type: '', text: '' });

        try {
            const result = await createCategory({
                name: newCategoryName.trim()
            });

            if (result.success) {
                setCategoryMessage({
                    type: 'success',
                    text: result.message || 'Kategória bola úspešne vytvorená!'
                });

                // Обновляем список категорий
                await loadCategories();

                // Очищаем поле ввода
                setNewCategoryName('');

                // Автоматически выбираем новую категорию
                if (result.data?.data?._id) {
                    setFormData(prev => ({
                        ...prev,
                        category: result.data.data._id
                    }));
                }

                // Убираем сообщение через 3 секунды
                setTimeout(() => {
                    setCategoryMessage({ type: '', text: '' });
                }, 3000);
            } else {
                setCategoryMessage({
                    type: 'error',
                    text: result.message || 'Chyba pri vytváraní kategórie'
                });
            }
        } catch (error) {
            console.error('Error creating category:', error);
            setCategoryMessage({
                type: 'error',
                text: 'Neočakávaná chyba pri vytváraní kategórie'
            });
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleSave = async (submitForReview = false) => {
        setMessage({ type: '', text: '' });

        // Базовая валидация
        if (!formData.title.trim()) {
            setMessage({ type: 'error', text: 'Nadpis článku je povinný' });
            return;
        }

        if (!formData.slug.trim()) {
            setMessage({ type: 'error', text: 'URL adresa (slug) je povinná' });
            return;
        }

        if (!formData.excerpt.trim() || formData.excerpt.length < 150) {
            setMessage({ type: 'error', text: 'Perex musí obsahovať minimálne 150 znakov' });
            return;
        }

        if (!formData.content.trim() || formData.content.length < 500) {
            setMessage({ type: 'error', text: 'Obsah článku musí obsahovať minimálne 500 znakov' });
            return;
        }

        if (!formData.category) {
            setMessage({ type: 'error', text: 'Vyberte kategóriu článku' });
            return;
        }

        setLoading(true);

        try {
            const articleData = {
                title: formData.title.trim(),
                slug: formData.slug.trim(),
                excerpt: formData.excerpt.trim(),
                content: formData.content.trim(),
                category: formData.category,
                tags: formData.tags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0),
                featuredImage: formData.featuredImage || undefined,
                submitForReview
            };

            const result = await createArticle(articleData);

            if (!result.success) {
                setMessage({ type: 'error', text: result.message });
                setLoading(false);
                return;
            }

            setMessage({
                type: 'success',
                text: submitForReview
                    ? 'Článok bol vytvorený a odoslaný na moderáciu!'
                    : 'Článok bol úspešne uložený ako koncept!'
            });

            // Redirect через 2 секунды
            setTimeout(() => {
                router.push('/profil/moje-clanky');
            }, 2000);

        } catch (error) {
            console.error('Error creating article:', error);
            setMessage({
                type: 'error',
                text: 'Neočakávaná chyba pri vytváraní článku. Skúste to znova.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Подсчет символов
    const getCharacterCount = (text, max) => {
        const count = text.length;
        const remaining = max - count;
        return {
            count,
            remaining,
            className: remaining < 0 ? 'character-count--error' :
                remaining < 20 ? 'character-count--warning' :
                    'character-count--normal'
        };
    };

    const titleCount = getCharacterCount(formData.title, 200);
    const excerptCount = getCharacterCount(formData.excerpt, 320);
    const contentCount = getCharacterCount(formData.content, 10000);

    return (
        <div className="new-article-page">
            <div className="new-article__header">
                <h1>Nový článok</h1>
                <p>Vytvorte nový článok pre publikáciu na portáli</p>
            </div>

            <div className="new-article__content">
                {/* Message */}
                {message.text && (
                    <div className={`new-article__message new-article__message--${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form className="new-article__form" onSubmit={(e) => e.preventDefault()}>

                    {/* Title */}
                    <div className="new-article__field">
                        <label htmlFor="title" className="new-article__label">
                            Nadpis článku *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="new-article__input"
                            placeholder="Napíšte výstižný nadpis článku..."
                            maxLength="200"
                            disabled={loading}
                        />
                        <div className={`character-count ${titleCount.className}`}>
                            {titleCount.count}/200 znakov
                        </div>
                    </div>

                    {/* Slug */}
                    <div className="new-article__field">
                        <label htmlFor="slug" className="new-article__label">
                            URL adresa (slug) *
                        </label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            className="new-article__input"
                            placeholder="url-adresa-clanku"
                            disabled={loading}
                        />
                        <small className="new-article__hint">
                            Automaticky sa generuje z nadpisu. Môžete upraviť podľa potreby.
                        </small>
                    </div>

                    {/* Excerpt */}
                    <div className="new-article__field">
                        <label htmlFor="excerpt" className="new-article__label">
                            Perex (krátky popis) *
                        </label>
                        <textarea
                            id="excerpt"
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleInputChange}
                            className="new-article__textarea"
                            placeholder="Napíšte krátky popis článku, ktorý sa zobrazí v náhľade... (minimálne 150 znakov)"
                            rows="3"
                            maxLength="320"
                            disabled={loading}
                        />
                        <div className={`character-count ${excerptCount.className}`}>
                            {excerptCount.count}/320 znakov (min. 150)
                        </div>
                    </div>

                    {/* ADMIN: Create new category block */}
                    {user.role === 'admin' && (
                        <div className="new-article__category-creator">
                            <h3>➕ Vytvoriť novú kategóriu (len pre admina)</h3>

                            {categoryMessage.text && (
                                <div className={`new-article__message new-article__message--${categoryMessage.type}`}>
                                    {categoryMessage.text}
                                </div>
                            )}

                            <div className="new-article__category-form">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Názov novej kategórie..."
                                    className="new-article__input"
                                    disabled={creatingCategory}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleCreateCategory();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleCreateCategory}
                                    disabled={creatingCategory || !newCategoryName.trim()}
                                    className="new-article__btn new-article__btn--create-category"
                                >
                                    {creatingCategory ? '⏳ Vytváram...' : '✅ Vytvoriť kategóriu'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Category */}
                    <div className="new-article__field">
                        <label htmlFor="category" className="new-article__label">
                            Kategória *
                        </label>
                        {loadingCategories ? (
                            <div className="new-article__loading">Načítavam kategórie...</div>
                        ) : (
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="new-article__select"
                                disabled={loading}
                            >
                                <option value="">Vyberte kategóriu</option>
                                {Array.isArray(categories) && categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {!loadingCategories && categories.length === 0 && (
                            <small className="new-article__hint new-article__hint--error">
                                Žiadne kategórie nie sú k dispozícii. {user.role === 'admin' ? 'Vytvorte novú kategóriu vyššie.' : 'Kontaktujte administrátora.'}
                            </small>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="new-article__field">
                        <label htmlFor="tags" className="new-article__label">
                            Tagy (nepovinné)
                        </label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            className="new-article__input"
                            placeholder="investície, kryptomeny, Bitcoin"
                            disabled={loading}
                        />
                        <small className="new-article__hint">
                            Oddeľte tagy čiarkou. Napríklad: investície, kryptomeny, Bitcoin
                        </small>
                    </div>

                    {/* Featured Image */}
                    <div className="new-article__field">
                        <label className="new-article__label">
                            Hlavný obrázok (nepovinné)
                        </label>
                        <div className="new-article__image-upload">
                            {imagePreview ? (
                                <div className="new-article__image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="new-article__remove-image"
                                        disabled={loading}
                                    >
                                        ✕ Odstrániť
                                    </button>
                                </div>
                            ) : (
                                <label className="new-article__upload-label">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={loading}
                                        style={{ display: 'none' }}
                                    />
                                    📁 Nahrať obrázok (max 5MB)
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="new-article__field">
                        <label htmlFor="content" className="new-article__label">
                            Obsah článku *
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleInputChange}
                            className="new-article__textarea new-article__textarea--large"
                            placeholder="Napíšte obsah článku... (minimálne 500 znakov)"
                            rows="15"
                            maxLength="10000"
                            disabled={loading}
                        />
                        <div className={`character-count ${contentCount.className}`}>
                            {contentCount.count}/10000 znakov (min. 500)
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="new-article__actions">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            disabled={loading}
                            className="new-article__btn new-article__btn--cancel"
                        >
                            Zrušiť
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSave(false)}
                            disabled={loading}
                            className="new-article__btn new-article__btn--draft"
                        >
                            {loading ? '💾 Ukladám...' : '💾 Uložiť ako koncept'}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSave(true)}
                            disabled={loading}
                            className="new-article__btn new-article__btn--submit"
                        >
                            {loading ? '📤 Odosielam...' : '📤 Uložiť a odoslať na moderáciu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewArticlePage;