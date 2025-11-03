"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    createArticle,
    getArticleById,
    updateArticle,
    submitArticleForReview
} from "@/actions/articles.actions";
import { getAllCategories } from "@/actions/categories.actions";
import { Editor } from '@tinymce/tinymce-react';
import "./NewArticlePage.scss";

const NewArticlePage = ({ user, articleId: propsArticleId }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editorRef = useRef(null);

    // ✅ REFS для автофокуса на ошибки
    const titleRef = useRef(null);
    const excerptRef = useRef(null);
    const categoryRef = useRef(null);
    const contentRef = useRef(null);

    const queryArticleId = searchParams.get('id');
    const articleId = propsArticleId || queryArticleId;
    const isEditMode = !!articleId;

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        tags: ''
    });

    const [loading, setLoading] = useState(false);
    const [loadingArticle, setLoadingArticle] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (articleId) {
            loadArticle(articleId);
        }
    }, [articleId]);

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
            } else {
                setMessage({ type: 'error', text: result.message || 'Chyba pri načítavaní kategórií' });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            setMessage({ type: 'error', text: 'Chyba pri načítavaní kategórií' });
        } finally {
            setLoadingCategories(false);
        }
    };

    const loadArticle = async (id) => {
        setLoadingArticle(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await getArticleById(id);

            if (!result.success) {
                setMessage({ type: 'error', text: result.message || 'Chyba pri načítavaní článku' });
                return;
            }

            const article = result.data;

            if (article.status === 'pending') {
                setMessage({
                    type: 'error',
                    text: 'Článok je na moderácii a nemožno ho upravovať. Počkajte na rozhodnutie administrátora.'
                });
                setTimeout(() => {
                    router.push('/profil/moje-clanky');
                }, 2000);
                return;
            }

            setFormData({
                title: article.title || '',
                excerpt: article.excerpt || '',
                content: article.content || '',
                category: article.category?._id || '',
                tags: article.tags?.join(', ') || ''
            });

        } catch (error) {
            console.error('Error loading article:', error);
            setMessage({ type: 'error', text: 'Chyba pri načítavaní článku' });
        } finally {
            setLoadingArticle(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditorChange = (content) => {
        setFormData(prev => ({
            ...prev,
            content: content
        }));
    };

    // ✅ ФУНКЦИЯ АВТОФОКУСА НА ОШИБКУ
    const focusOnError = (fieldName) => {
        let targetRef = null;
        let fieldElement = null;

        switch (fieldName) {
            case 'title':
                targetRef = titleRef;
                break;
            case 'excerpt':
                targetRef = excerptRef;
                break;
            case 'category':
                targetRef = categoryRef;
                break;
            case 'content':
                targetRef = contentRef;
                break;
        }

        if (targetRef?.current) {
            fieldElement = targetRef.current.closest('.new-article__field');

            // Добавляем класс ошибки с анимацией
            if (fieldElement) {
                fieldElement.classList.add('new-article__field--error');

                // Убираем класс через 2 секунды
                setTimeout(() => {
                    fieldElement.classList.remove('new-article__field--error');
                }, 2000);
            }

            // Фокусируемся на поле
            targetRef.current.focus();

            // Скроллим к полю
            targetRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    const handleSave = async (submitForReview = false) => {
        setMessage({ type: '', text: '' });

        // Валидация с автофокусом
        if (!formData.title.trim()) {
            setMessage({ type: 'error', text: 'Nadpis článku je povinný' });
            focusOnError('title');
            return;
        }

        if (!formData.excerpt.trim()) {
            setMessage({ type: 'error', text: 'Perex je povinný' });
            focusOnError('excerpt');
            return;
        }

        if (formData.excerpt.trim().length < 150) {
            setMessage({ type: 'error', text: 'Perex musí obsahovať minimálne 150 znakov' });
            focusOnError('excerpt');
            return;
        }

        if (!formData.content.trim()) {
            setMessage({ type: 'error', text: 'Obsah článku je povinný' });
            focusOnError('content');
            return;
        }

        if (formData.content.trim().length < 500) {
            setMessage({ type: 'error', text: 'Obsah musí obsahovať minimálne 500 znakov' });
            focusOnError('content');
            return;
        }

        if (!formData.category) {
            setMessage({ type: 'error', text: 'Kategória je povinná' });
            focusOnError('category');
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
                    .filter(tag => tag.length > 0)
            };

            let result;

            if (isEditMode) {
                result = await updateArticle(articleId, articleData);
            } else {
                result = await createArticle(articleData);
            }

            if (!result.success) {
                setMessage({
                    type: 'error',
                    text: result.message || 'Chyba pri ukladaní článku'
                });
                return;
            }

            const savedArticle = result.data;
            const currentArticleId = savedArticle._id || articleId;

            if (submitForReview) {
                const submitResult = await submitArticleForReview(currentArticleId);

                if (submitResult.success) {
                    setMessage({
                        type: 'success',
                        text: 'Článok bol úspešne odoslaný na moderáciu. Počkajte na rozhodnutie administrátora.'
                    });

                    setTimeout(() => {
                        router.push('/profil/moje-clanky');
                    }, 2000);
                } else {
                    setMessage({
                        type: 'error',
                        text: submitResult.message || 'Chyba pri odosielaní na moderáciu'
                    });
                }
            } else {
                setMessage({
                    type: 'success',
                    text: isEditMode
                        ? 'Článok bol úspešne upravený'
                        : 'Článok bol úspešne vytvorený ako koncept'
                });

                if (isEditMode) {
                    setTimeout(() => {
                        router.push(`/profil/moje-clanky/${savedArticle._id}/ukazka`);
                    }, 1000);
                } else {
                    router.push(`/profil/novy-clanok?id=${savedArticle._id}`);
                }
            }

        } catch (error) {
            console.error('Error saving article:', error);
            setMessage({
                type: 'error',
                text: 'Neočakávaná chyba. Skúste to znova.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = () => {
        if (articleId) {
            router.push(`/profil/moje-clanky/${articleId}/ukazka`);
        }
    };

    const getCharacterCount = (text, max) => {
        const count = text.length;
        const remaining = max - count;
        return {
            count,
            remaining,
            className: remaining < 0 ? 'text-danger' : remaining < 50 ? 'text-warning' : ''
        };
    };

    const excerptCount = getCharacterCount(formData.excerpt, 200);
    const contentCount = getCharacterCount(formData.content, 5000);

    if (loadingArticle) {
        return (
            <div className="new-article">
                <div className="new-article__loading">
                    <div className="spinner"></div>
                    <p>Načítavam článok...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="new-article">
            <div className="new-article__container">
                <div className="new-article__header">
                    <h1>
                        {isEditMode ? 'Upraviť článok' : 'Nový článok'}
                    </h1>
                    <p>
                        {isEditMode
                            ? 'Upravte svoj článok a uložte zmeny'
                            : 'Vytvorte nový článok pre váš blog'
                        }
                    </p>
                </div>

                {message.text && (
                    <div className={`new-article__message new-article__message--${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form className="new-article__form">
                    {/* Nadpis článku */}
                    <div className="new-article__field">
                        <label htmlFor="title" className="new-article__label">
                            Nadpis článku *
                        </label>
                        <input
                            ref={titleRef}
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="new-article__input"
                            placeholder="Zadajte nadpis vášho článku..."
                            maxLength={200}
                            disabled={loading}
                        />
                        <div className="new-article__char-count">
                            {formData.title.length} / 200 znakov
                        </div>
                    </div>

                    {/* Perex */}
                    <div className="new-article__field">
                        <label htmlFor="excerpt" className="new-article__label">
                            Perex (krátky popis) *
                        </label>
                        <textarea
                            ref={excerptRef}
                            id="excerpt"
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleInputChange}
                            className="new-article__textarea"
                            placeholder="Napíšte krátky popis článku (min. 150 znakov)..."
                            rows={4}
                            disabled={loading}
                        />
                        <div className={`new-article__char-count ${excerptCount.className}`}>
                            {excerptCount.count} / 200 znakov
                            {excerptCount.remaining < 0 && ` (${Math.abs(excerptCount.remaining)} nad limit)`}
                            {excerptCount.count < 150 && ` (ešte ${150 - excerptCount.count} znakov do minima)`}
                        </div>
                    </div>

                    {/* Kategória */}
                    <div className="new-article__field">
                        <label htmlFor="category" className="new-article__label">
                            Kategória *
                        </label>
                        <select
                            ref={categoryRef}
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="new-article__select"
                            disabled={loading || loadingCategories}
                        >
                            <option value="">Vyberte kategóriu</option>
                            {categories.map(category => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {loadingCategories && (
                            <div className="new-article__loading-text">Načítavam kategórie...</div>
                        )}
                    </div>

                    {/* Tagy */}
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
                            placeholder="Zadajte tagy oddelené čiarkami (napr. technológie, programovanie, AI)"
                            disabled={loading}
                        />
                        <div className="new-article__field-hint">
                            Tagy pomáhajú čitateľom nájsť váš článok
                        </div>
                    </div>

                    {/* TinyMCE Editor */}
                    <div className="new-article__field">
                        <label className="new-article__label">
                            Obsah článku *
                        </label>
                        <div ref={contentRef} className="new-article__editor-wrapper">
                            <Editor
                                apiKey={process.env.NEXT_PUBLIC_TINYMCE}
                                ref={editorRef}
                                value={formData.content}
                                onEditorChange={handleEditorChange}
                                init={{
                                    height: 500,
                                    menubar: true,
                                    plugins: [
                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                        'insertdatetime', 'media', 'table', 'help', 'wordcount',
                                        'emoticons', 'codesample'
                                    ],
                                    toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                                        'bold italic underline strikethrough | forecolor backcolor | ' +
                                        'alignleft aligncenter alignright alignjustify | ' +
                                        'bullist numlist outdent indent | ' +
                                        'table tabledelete | tableprops tablerowprops tablecellprops | ' +
                                        'tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
                                        'tableinsertcolbefore tableinsertcolafter tabledeletecol | ' +
                                        'link image media emoticons codesample | ' +
                                        'removeformat code fullscreen preview help',

                                    toolbar_mode: 'sliding',

                                    // Настройки таблиц
                                    table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
                                    table_appearance_options: true,
                                    table_grid: true,
                                    table_resize_bars: true,
                                    table_default_attributes: {
                                        border: '1'
                                    },
                                    table_default_styles: {
                                        width: '100%',
                                        'border-collapse': 'collapse'
                                    },

                                    // Настройки изображений
                                    image_advtab: true,
                                    image_title: true,
                                    image_description: true,
                                    automatic_uploads: true,
                                    file_picker_types: 'image',

                                    // Настройки медиа
                                    media_live_embeds: true,

                                    // Стили контента
                                    content_style: `
                                        body { 
                                            font-family: 'Montserrat', Arial, sans-serif; 
                                            font-size: 16px;
                                            line-height: 1.6;
                                            color: #2d3748;
                                            padding: 20px;
                                        }
                                        table {
                                            border-collapse: collapse;
                                            width: 100%;
                                            margin: 20px 0;
                                        }
                                        table td, table th {
                                            border: 1px solid #e2e8f0;
                                            padding: 12px;
                                            text-align: left;
                                        }
                                        table th {
                                            background-color: #f7fafc;
                                            font-weight: 600;
                                        }
                                    `,

                                    placeholder: 'Začnite písať obsah vášho článku...',

                                    setup: (editor) => {
                                        editor.on('change', () => {
                                            const content = editor.getContent();
                                            setFormData(prev => ({
                                                ...prev,
                                                content: content
                                            }));
                                        });
                                    }
                                }}
                                disabled={loading}
                            />
                        </div>
                        <div className={`new-article__char-count ${contentCount.className}`}>
                            {contentCount.count} znakov
                            {contentCount.count < 500 && ` (ešte ${500 - contentCount.count} znakov do minima)`}
                        </div>
                    </div>

                    <div className="new-article__actions">
                        {isEditMode && (
                            <button
                                type="button"
                                className="new-article__btn new-article__btn--secondary"
                                onClick={handlePreview}
                                disabled={loading}
                            >
                                👁️ Náhľad
                            </button>
                        )}

                        <button
                            type="button"
                            className="new-article__btn new-article__btn--draft"
                            onClick={() => handleSave(false)}
                            disabled={loading}
                        >
                            {loading ? 'Ukladanie...' : isEditMode ? 'Uložiť zmeny' : 'Uložiť ako koncept'}
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