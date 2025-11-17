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
import {
    validateImageFile,
    createImagePreview,
    revokeImagePreview,
    getArticleImageUrl,
    formatFileSize
} from "@/utils/imageHelpers";
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
    const imageInputRef = useRef(null); // ✨ NEW: Ref для input file

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

    // ✨ NEW: State для изображения
    const [selectedImage, setSelectedImage] = useState(null); // File объект
    const [imagePreview, setImagePreview] = useState(null); // URL для preview
    const [existingImage, setExistingImage] = useState(null); // Имя существующей картинки
    const [imageToDelete, setImageToDelete] = useState(false); // Флаг удаления
    const [uploadingImage, setUploadingImage] = useState(false);

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

    // ✨ NEW: Очистка preview URL при размонтировании
    useEffect(() => {
        return () => {
            if (imagePreview) {
                revokeImagePreview(imagePreview);
            }
        };
    }, [imagePreview]);

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

            // ✨ NEW: Загружаем существующее изображение
            if (article.coverImage) {
                setExistingImage(article.coverImage);
                setImagePreview(getArticleImageUrl(article.coverImage));
            }

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

    // ✨ NEW: Обработчик выбора изображения
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Валидация файла
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setMessage({ type: 'error', text: validation.error });
            return;
        }

        // Очищаем старый preview если был
        if (imagePreview && selectedImage) {
            revokeImagePreview(imagePreview);
        }

        // Устанавливаем новое изображение
        setSelectedImage(file);
        setImagePreview(createImagePreview(file));
        setImageToDelete(false); // Сбрасываем флаг удаления
        setMessage({ type: '', text: '' });
    };

    // ✨ NEW: Удаление выбранного изображения
    const handleImageRemove = () => {
        // Очищаем preview
        if (imagePreview && selectedImage) {
            revokeImagePreview(imagePreview);
        }

        setSelectedImage(null);
        setImagePreview(null);

        // Если есть существующая картинка - помечаем на удаление
        if (existingImage) {
            setImageToDelete(true);
        }

        // Очищаем input
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    // ✨ NEW: Открытие file picker
    const handleImageClick = () => {
        imageInputRef.current?.click();
    };

    // ✅ ФУНКЦИЯ АВТОФОКУСА НА ОШИБКУ
    const focusOnError = (fieldName) => {
        let targetRef = null;

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
            case 'image':
                targetRef = imageInputRef;
                break;
        }

        if (targetRef?.current) {
            // Для TinyMCE editor (content)
            if (fieldName === 'content' && editorRef.current) {
                setTimeout(() => {
                    editorRef.current.focus();
                }, 100);
            } else {
                targetRef.current.focus();
                targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    // Подсчет символов для excerpt
    const excerptCount = {
        count: formData.excerpt.length,
        remaining: 200 - formData.excerpt.length,
        className: formData.excerpt.length > 200 ? 'new-article__char-count--error' : ''
    };

    const handleSave = async (submitForReview = false) => {
        setMessage({ type: '', text: '' });

        // Валидация
        if (!formData.title || formData.title.trim().length < 10) {
            setMessage({ type: 'error', text: 'Nadpis musí obsahovať minimálne 10 znakov' });
            focusOnError('title');
            return;
        }

        if (!formData.excerpt || formData.excerpt.trim().length < 150) {
            setMessage({ type: 'error', text: 'Perex musí obsahovať minimálne 150 znakov' });
            focusOnError('excerpt');
            return;
        }

        if (formData.excerpt.trim().length > 200) {
            setMessage({ type: 'error', text: 'Perex môže obsahovať maximálne 200 znakov' });
            focusOnError('excerpt');
            return;
        }

        if (!formData.content || formData.content.trim() === '') {
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

        // ✨ NEW: Валидация изображения при отправке на модерацию
        if (submitForReview && !selectedImage && !existingImage) {
            setMessage({
                type: 'error',
                text: 'Obrázok je povinný pre odoslanie článku na moderáciu'
            });
            focusOnError('image');
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
                // ✨ NEW: Передаем изображение в updateArticle
                result = await updateArticle(articleId, articleData, selectedImage);
            } else {
                // ✨ NEW: Передаем изображение в createArticle
                result = await createArticle(articleData, selectedImage);
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

                setTimeout(() => {
                    router.push('/profil/moje-clanky');
                }, 1500);
            }

        } catch (error) {
            console.error('Error saving article:', error);
            setMessage({
                type: 'error',
                text: 'Nastala neočakávaná chyba pri ukladaní článku'
            });
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="new-article__title">
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

                    {/* ✨ NEW: Загрузка изображения */}
                    <div className="new-article__field">
                        <label className="new-article__label">
                            Obrázok článku {!isEditMode && !existingImage && '(povinný pre moderáciu)'}
                        </label>

                        {/* Скрытый input */}
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                            disabled={loading}
                        />

                        {/* Preview изображения */}
                        {imagePreview ? (
                            <div className="new-article__image-preview">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="new-article__image-preview-img"
                                />
                                <div className="new-article__image-actions">
                                    <button
                                        type="button"
                                        onClick={handleImageClick}
                                        className="new-article__image-button new-article__image-button--change"
                                        disabled={loading}
                                    >
                                        📷 Zmeniť obrázok
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleImageRemove}
                                        className="new-article__image-button new-article__image-button--remove"
                                        disabled={loading}
                                    >
                                        🗑️ Odstrániť
                                    </button>
                                </div>
                                {selectedImage && (
                                    <div className="new-article__image-info">
                                        {selectedImage.name} ({formatFileSize(selectedImage.size)})
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                className="new-article__image-placeholder"
                                onClick={handleImageClick}
                            >
                                <div className="new-article__image-placeholder-icon">📷</div>
                                <p className="new-article__image-placeholder-text">
                                    Kliknite pre nahratie obrázka
                                </p>
                                <p className="new-article__image-placeholder-hint">
                                    JPG, PNG alebo WEBP (max 5MB)
                                </p>
                            </div>
                        )}

                        <div className="new-article__field-hint">
                            Odporúčaná veľkosť: 1200 x 630 px pre optimálne zobrazenie
                        </div>
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
                                onInit={(evt, editor) => editorRef.current = editor}
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
                                        'bold italic forecolor | alignleft aligncenter ' +
                                        'alignright alignjustify | bullist numlist outdent indent | ' +
                                        'removeformat | table | link image | code | help',
                                    content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size:14px }',
                                    language: 'sk',
                                    branding: false
                                }}
                                disabled={loading}
                            />
                        </div>
                        <div className="new-article__field-hint">
                            Minimálne 500 znakov
                        </div>
                    </div>

                    {/* Кнопки действий */}
                    <div className="new-article__actions">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="new-article__button new-article__button--cancel"
                            disabled={loading}
                        >
                            Zrušiť
                        </button>

                        <div className="new-article__actions-right">
                            <button
                                type="button"
                                onClick={() => handleSave(false)}
                                className="new-article__button new-article__button--draft"
                                disabled={loading}
                            >
                                {loading ? 'Ukladám...' : isEditMode ? 'Uložiť zmeny' : 'Uložiť ako koncept'}
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSave(true)}
                                className="new-article__button new-article__button--submit"
                                disabled={loading}
                            >
                                {loading ? 'Odosielam...' : 'Odoslať na moderáciu'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewArticlePage;