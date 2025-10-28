"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createArticle } from "@/actions/articles.actions";
import { getAllCategories } from "@/actions/categories.actions";
import { Editor } from '@tinymce/tinymce-react';
import "./NewArticlePage.scss";

const NewArticlePage = ({ user }) => {
    const router = useRouter();
    const editorRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        tags: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Состояние для категорий
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Загрузка категорий при монтировании компонента
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoadingCategories(true);
        try {
            const result = await getAllCategories();

            if (result.success) {
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Обработка изменений в TinyMCE
    const handleEditorChange = (content) => {
        setFormData(prev => ({
            ...prev,
            content: content
        }));
    };

    const handleSave = async (submitForReview = false) => {
        setMessage({ type: '', text: '' });

        // Базовая валидация
        if (!formData.title.trim()) {
            setMessage({ type: 'error', text: 'Nadpis článku je povinný' });
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
                excerpt: formData.excerpt.trim(),
                content: formData.content.trim(),
                category: formData.category,
                tags: formData.tags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0),
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
                        {loadingCategories ? (
                            <div className="new-article__loading">
                                Načítavanie kategórií...
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="new-article__no-categories">
                                <p>Zatiaľ neboli vytvorené žiadne kategórie.</p>
                                {user.role === 'admin' && (
                                    <p className="new-article__hint">
                                        Admin môže vytvoriť kategórie v sekcii "Kategórie".
                                    </p>
                                )}
                            </div>
                        ) : (
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="new-article__select"
                                disabled={loading}
                            >
                                <option value="">-- Vyberte kategóriu --</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="new-article__field">
                        <label htmlFor="tags" className="new-article__label">
                            Tagy (voliteľné)
                        </label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            className="new-article__input"
                            placeholder="technológie, financie, spravodajstvo (oddelené čiarkou)"
                            disabled={loading}
                        />
                        <small className="new-article__hint">
                            Oddeľte tagy čiarkou. Príklad: finančné trhy, investície, burza
                        </small>
                    </div>

                    {/* Content - TinyMCE Editor */}
                    <div className="new-article__field">
                        <label className="new-article__label">
                            Obsah článku *
                        </label>
                        <div className="new-article__editor-wrapper">
                            <Editor
                                apiKey = {process.env.NEXT_PUBLIC_TINYMCE} 
                                onInit={(evt, editor) => editorRef.current = editor}
                                value={formData.content}
                                onEditorChange={handleEditorChange}
                                init={{
                                    height: 600,
                                    menubar: true,
                                    plugins: [
                                        // Core editing features
                                        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 
                                        'link', 'lists', 'media', 'searchreplace', 'table', 
                                        'visualblocks', 'wordcount',
                                        // Premium features (trial until Nov 4, 2025)
                                        'checklist', 'mediaembed', 'casechange', 'formatpainter', 
                                        'pageembed', 'a11ychecker', 'tinymcespellchecker', 
                                        'permanentpen', 'powerpaste', 'advtable', 'advcode', 
                                        'advtemplate', 'mentions', 'tinycomments', 
                                        'tableofcontents', 'footnotes', 'mergetags', 
                                        'autocorrect', 'typography', 'inlinecss', 'markdown',
                                        'importword', 'exportword', 'exportpdf'
                                    ],
                                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
                                        'link media table mergetags | addcomment showcomments | ' +
                                        'spellcheckdialog a11ycheck typography | align lineheight | ' +
                                        'checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                                    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 16px; line-height: 1.6; }',
                                    language: 'sk',
                                    placeholder: 'Začnite písať obsah článku...',
                                    tinycomments_mode: 'embedded',
                                    tinycomments_author: user?.displayName || 'Author',
                                    mergetags_list: [
                                        { value: 'First.Name', title: 'First Name' },
                                        { value: 'Email', title: 'Email' },
                                    ],
                                }}
                                disabled={loading}
                            />
                        </div>
                        <div className={`character-count ${contentCount.className}`}>
                            {contentCount.count}/10000 znakov (min. 500)
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="new-article__actions">
                        <button
                            type="button"
                            className="new-article__btn new-article__btn--secondary"
                            onClick={() => router.push('/profil/moje-clanky')}
                            disabled={loading}
                        >
                            Zrušiť
                        </button>
                        <button
                            type="button"
                            className="new-article__btn new-article__btn--draft"
                            onClick={() => handleSave(false)}
                            disabled={loading}
                        >
                            {loading ? 'Ukladanie...' : 'Uložiť ako koncept'}
                        </button>
                        <button
                            type="button"
                            className="new-article__btn new-article__btn--primary"
                            onClick={() => handleSave(true)}
                            disabled={loading}
                        >
                            {loading ? 'Odosiela sa...' : 'Odoslať na moderáciu'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default NewArticlePage;