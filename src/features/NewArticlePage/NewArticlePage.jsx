"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createArticle } from "@/actions/articles.actions";
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

    // Predefined categories (в будущем можно получать из API)
    const categories = [
        { id: '1', name: 'Bankovníctvo' },
        { id: '2', name: 'Úvery a hypotéky' },
        { id: '3', name: 'Poisťovníctvo' },
        { id: '4', name: 'Dane a účtovníctvo' },
        { id: '5', name: 'Investície' },
        { id: '6', name: 'Kryptomeny' },
        { id: '7', name: 'Ekonomika' },
        { id: '8', name: 'Finančné plánovanie' },
        { id: '9', name: 'Podnikanie' },
        { id: '10', name: 'Technológie vo financiách' }
    ];

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
            .replace(/[\u0300-\u036f]/g, '') // убираем диакритику
            .replace(/[^\w\s-]/g, '') // убираем спецсимволы
            .replace(/\s+/g, '-') // пробелы в дефисы
            .replace(/-+/g, '-') // множественные дефисы в один
            .replace(/^-+|-+$/g, ''); // убираем дефисы в начале и конце
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validation
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setMessage({ type: 'error', text: 'Obrázok nesmie byť väčší ako 5MB' });
                return;
            }

            if (!file.type.startsWith('image/')) {
                setMessage({ type: 'error', text: 'Povolené sú len obrázky' });
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
                setFormData(prev => ({
                    ...prev,
                    featuredImage: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            featuredImage: ''
        }));
        setImagePreview(null);
        // Clear file input
        const fileInput = document.getElementById('featuredImage');
        if (fileInput) fileInput.value = '';
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({
            ...prev,
            content
        }));
    };

    const validateForm = () => {
        if (!formData.title.trim() || formData.title.trim().length < 10) {
            setMessage({ type: 'error', text: 'Nadpis musí obsahovať minimálne 10 znakov' });
            return false;
        }

        if (!formData.slug.trim() || formData.slug.trim().length < 5) {
            setMessage({ type: 'error', text: 'URL adresa (slug) musí obsahovať minimálne 5 znakov' });
            return false;
        }

        if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            setMessage({ type: 'error', text: 'URL adresa môže obsahovať len malé písmená, čísla a pomlčky' });
            return false;
        }

        if (!formData.excerpt.trim() || formData.excerpt.trim().length < 150) {
            setMessage({ type: 'error', text: 'Perex musí obsahovať minimálne 150 znakov' });
            return false;
        }

        if (!formData.content.trim() || formData.content.trim().length < 100) {
            setMessage({ type: 'error', text: 'Obsah článku musí obsahovať minimálne 100 znakov' });
            return false;
        }

        if (!formData.category) {
            setMessage({ type: 'error', text: 'Vyberte kategóriu' });
            return false;
        }

        return true;
    };

    const handleSave = async (submitForReview = false) => {
        setMessage({ type: '', text: '' });

        // Валидация формы
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Подготовка данных для отправки
            const articleData = {
                title: formData.title.trim(),
                slug: formData.slug.trim(),
                excerpt: formData.excerpt.trim(),
                content: formData.content.trim(),
                category: formData.category,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
                featuredImage: formData.featuredImage || undefined
            };

            // Создание статьи через Server Action
            const result = await createArticle(articleData);

            if (!result.success) {
                setMessage({ type: 'error', text: result.message || 'Chyba pri vytváraní článku' });
                setLoading(false);
                return;
            }

            // Успешное создание
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

                    {/* Category */}
                    <div className="new-article__field">
                        <label htmlFor="category" className="new-article__label">
                            Kategória *
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="new-article__select"
                            disabled={loading}
                        >
                            <option value="">Vyberte kategóriu</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
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
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label htmlFor="featuredImage" className="new-article__upload-area">
                                    <div className="new-article__upload-icon">📷</div>
                                    <p>Kliknite pre nahratie obrázka</p>
                                    <small>JPG, PNG, max 5MB</small>
                                </label>
                            )}
                            <input
                                type="file"
                                id="featuredImage"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="new-article__file-input"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div className="new-article__field">
                        <label className="new-article__label">
                            Obsah článku *
                        </label>
                        <div className="new-article__editor">
                            <textarea
                                value={formData.content}
                                onChange={(e) => handleContentChange(e.target.value)}
                                className="new-article__content-textarea"
                                placeholder="Napíšte obsah článku... (minimálne 100 znakov)"
                                rows="15"
                                disabled={loading}
                            />
                            <div className="new-article__editor-note">
                                <small>💡 Tip: Používajte odsady a prázdne riadky pre lepšiu čitateľnosť</small>
                            </div>
                            <div className={`character-count ${contentCount.className}`}>
                                {contentCount.count} znakov (min. 100)
                            </div>
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