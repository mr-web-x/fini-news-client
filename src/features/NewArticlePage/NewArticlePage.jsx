"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createArticle, getArticleById, updateArticle } from "@/actions/articles.actions";
import { getAllCategories } from "@/actions/categories.actions";
import { Editor } from '@tinymce/tinymce-react';
import "./NewArticlePage.scss";

const NewArticlePage = ({ user }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editorRef = useRef(null);

    // ✅ НОВОЕ: получаем articleId из query параметра
    const articleId = searchParams.get('id');
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

    // Состояние для категорий
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // ✅ Загрузка категорий при монтировании компонента
    useEffect(() => {
        loadCategories();
    }, []);

    // ✅ НОВОЕ: Загрузка статьи при монтировании (если есть articleId)
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

    // ✅ ИСПРАВЛЕНО: Загрузка статьи для редактирования с правильной проверкой прав
    const loadArticle = async (id) => {
        setLoadingArticle(true);
        try {
            const result = await getArticleById(id);

            if (!result.success) {
                setMessage({ type: 'error', text: result.message || 'Статья не найдена' });
                // Редирект на страницу со списком статей
                setTimeout(() => {
                    router.push('/profil/moje-clanky');
                }, 2000);
                return;
            }

            const article = result.data;

            // ✅ ИСПРАВЛЕНО: Проверяем права доступа с правильным сравнением
            // article.author может быть либо объектом с _id, либо строкой
            const authorId = article.author?.id || article.author;
            const userId = user.id;

            // Сравниваем как строки (важно для MongoDB ObjectId)
            const isAuthor = String(authorId) === String(userId);
            const isAdmin = user.role === 'admin';

            console.log('🔍 [NewArticlePage] Проверка прав доступа:', {
                articleId: id,
                authorId: String(authorId),
                userId: String(userId),
                isAuthor,
                isAdmin,
                userRole: user.role
            });

            if (!isAuthor && !isAdmin) {
                setMessage({ type: 'error', text: 'Nemáte oprávnenie upravovať tento článok' });
                setTimeout(() => {
                    router.push('/profil/moje-clanky');
                }, 2000);
                return;
            }

            // Проверяем статус статьи
            if (article.status === 'published') {
                setMessage({ type: 'error', text: 'Publikované články nie je možné upravovať' });
                setTimeout(() => {
                    router.push('/profil/moje-clanky');
                }, 2000);
                return;
            }

            if (article.status === 'pending' && !isAdmin) {
                setMessage({ type: 'error', text: 'Článok je na moderácii. Počkajte na rozhodnutie administrátora.' });
                setTimeout(() => {
                    router.push('/profil/moje-clanky');
                }, 2000);
                return;
            }

            // Заполняем форму данными статьи
            setFormData({
                title: article.title || '',
                excerpt: article.excerpt || '',
                content: article.content || '',
                category: article.category?._id || '',
                tags: article.tags?.join(', ') || ''
            });

            console.log('✅ [NewArticlePage] Статья успешно загружена для редактирования');

        } catch (error) {
            console.error('❌ [NewArticlePage] Error loading article:', error);
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

        if (!formData.excerpt.trim()) {
            setMessage({ type: 'error', text: 'Perex je povinný' });
            return;
        }

        if (formData.excerpt.trim().length < 150) {
            setMessage({ type: 'error', text: 'Perex musí obsahovať minimálne 150 znakov' });
            return;
        }

        if (!formData.content.trim()) {
            setMessage({ type: 'error', text: 'Obsah článku je povinný' });
            return;
        }

        if (formData.content.trim().length < 500) {
            setMessage({ type: 'error', text: 'Obsah musí obsahovať minimálne 500 znakov' });
            return;
        }

        if (!formData.category) {
            setMessage({ type: 'error', text: 'Kategória je povinná' });
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

            // ✅ НОВОЕ: Редактирование или создание статьи
            if (isEditMode) {
                console.log('🔵 [NewArticlePage] Обновление статьи:', { articleId, articleData });
                result = await updateArticle(articleId, articleData);
            } else {
                result = await createArticle(articleData);
            }

            if (result.success) {
                const savedArticle = result.data;

                setMessage({
                    type: 'success',
                    text: isEditMode
                        ? 'Článok bol úspešne upravený'
                        : 'Článok bol úspešne vytvorený ako koncept'
                });

                // Если это создание новой статьи, обновляем URL с articleId
                if (!isEditMode) {
                    router.push(`/profil/novy-clanok?id=${savedArticle._id}`);
                }

                // Если нужно отправить на модерацию
                if (submitForReview) {
                    setTimeout(() => {
                        router.push('/profil/moje-clanky');
                    }, 1000);
                }
            } else {
                setMessage({
                    type: 'error',
                    text: result.message || 'Chyba pri ukladaní článku'
                });
            }
        } catch (error) {
            console.error('❌ [NewArticlePage] Error saving article:', error);
            setMessage({
                type: 'error',
                text: 'Neočakávaná chyba. Skúste to znova.'
            });
        } finally {
            setLoading(false);
        }
    };

    // ✅ НОВОЕ: Обработчик клика на кнопку "Náhľad"
    const handlePreview = () => {
        if (articleId) {
            router.push(`/profil/moje-clanky/${articleId}/ukazka`);
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

    // ✅ Показываем загрузку, если загружается статья
    if (loadingArticle) {
        return (
            <div className="new-article-page">
                <div className="new-article__header">
                    <h1>Načítavam článok...</h1>
                </div>
                <div className="new-article__content">
                    <div className="new-article__loading">
                        <div className="spinner"></div>
                        <p>Načítavam...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="new-article-page">
            <div className="new-article__header">
                <h1>{isEditMode ? 'Upraviť článok' : 'Nový článok'}</h1>
                <p>
                    {isEditMode
                        ? 'Upravte existujúci článok'
                        : 'Vytvorte nový článok pre publikáciu na portáli'}
                </p>
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
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="new-article__select"
                            disabled={loading || loadingCategories}
                        >
                            <option value="">Vyberte kategóriu</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
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
                            placeholder="React, JavaScript, Web Development (oddeľte čiarkou)"
                            disabled={loading}
                        />
                        <small className="new-article__help-text">
                            Pridajte tagy oddelené čiarkou (napr. React, JavaScript)
                        </small>
                    </div>

                    {/* Content (TinyMCE) */}
                    <div className="new-article__field">
                        <label htmlFor="content" className="new-article__label">
                            Obsah článku *
                        </label>
                        <div className="new-article__content-editor">
                            <Editor
                                apiKey={process.env.NEXT_PUBLIC_TINYMCE}
                                onInit={(evt, editor) => editorRef.current = editor}
                                value={formData.content}
                                onEditorChange={handleEditorChange}
                                init={{
                                    height: 600,
                                    menubar: true,
                                    plugins: [
                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                    ],
                                    toolbar: 'undo redo | blocks | ' +
                                        'bold italic forecolor | alignleft aligncenter ' +
                                        'alignright alignjustify | bullist numlist outdent indent | ' +
                                        'removeformat | help',
                                    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 16px; line-height: 1.6; }',
                                    language: 'sk',
                                    placeholder: 'Začnite písať obsah článku...',
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

                        {/* ✅ НОВОЕ: Кнопка "Náhľad" - только если статья уже сохранена */}
                        {isEditMode && (
                            <button
                                type="button"
                                className="new-article__btn new-article__btn--preview"
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