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
    const imageFieldRef = useRef(null); // Ref для поля изображения

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

    // ✅ NEW: State для ошибок полей
    const [fieldErrors, setFieldErrors] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        image: ''
    });

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

        // ✅ NEW: Очищаем ошибку при вводе
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleEditorChange = (content) => {
        setFormData(prev => ({
            ...prev,
            content: content
        }));

        // ✅ NEW: Очищаем ошибку при вводе
        if (fieldErrors.content) {
            setFieldErrors(prev => ({
                ...prev,
                content: ''
            }));
        }
    };

    // ✨ NEW: Обработчик выбора изображения
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Валидация файла
        const validation = validateImageFile(file);
        if (!validation.valid) {
            // ✅ NEW: Устанавливаем ошибку конкретно для поля изображения
            setFieldErrors(prev => ({
                ...prev,
                image: validation.error
            }));

            // ✅ FIXED: Используем requestAnimationFrame для гарантии обновления DOM
            requestAnimationFrame(() => {
                focusOnError('image');
            });

            // Очищаем input чтобы можно было выбрать другой файл
            if (e.target) {
                e.target.value = '';
            }

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

        // ✅ NEW: Очищаем ошибку изображения при успешной загрузке
        setFieldErrors(prev => ({
            ...prev,
            image: ''
        }));
        setMessage({ type: '', text: '' }); // Очищаем ошибку если файл валидный
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

        // ✅ NEW: Очищаем ошибку изображения при удалении
        setFieldErrors(prev => ({
            ...prev,
            image: ''
        }));

        // Очищаем input
        if (imageFieldRef.current) {
            const input = imageFieldRef.current.querySelector('input[type="file"]');
            if (input) input.value = '';
        }
    };

    // ✨ NEW: Открытие file picker
    const handleImageClick = () => {
        const input = document.getElementById('article-image-input');
        input?.click();
    };

    // ✅ FIXED: ПРАВИЛЬНАЯ функция автофокуса с гарантированной прокруткой
    const focusOnError = (fieldName) => {
        let targetElement = null;

        switch (fieldName) {
            case 'title':
                targetElement = titleRef.current;
                break;
            case 'excerpt':
                targetElement = excerptRef.current;
                break;
            case 'category':
                targetElement = categoryRef.current;
                break;
            case 'content':
                targetElement = contentRef.current;
                break;
            case 'image':
                targetElement = imageFieldRef.current;
                break;
        }

        if (targetElement) {
            // Находим поле формы
            const fieldElement = targetElement.closest ?
                targetElement.closest('.new-article__field') :
                targetElement;

            if (fieldElement) {
                // Добавляем класс ошибки для анимации
                fieldElement.classList.add('new-article__field--error');

                // Убираем класс через 3 секунды
                setTimeout(() => {
                    fieldElement.classList.remove('new-article__field--error');
                }, 3000);

                // ✅ FIXED: ГАРАНТИРОВАННАЯ прокрутка с небольшим отступом
                setTimeout(() => {
                    const elementRect = fieldElement.getBoundingClientRect();
                    const absoluteElementTop = elementRect.top + window.pageYOffset;
                    const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);

                    window.scrollTo({
                        top: middle,
                        behavior: 'smooth'
                    });

                    // Дополнительная визуализация для изображения
                    if (fieldName === 'image') {
                        const placeholder = fieldElement.querySelector('.new-article__image-placeholder');
                        if (placeholder) {
                            placeholder.style.borderColor = '#e53e3e';
                            placeholder.style.backgroundColor = '#fed7d7';
                            setTimeout(() => {
                                placeholder.style.borderColor = '';
                                placeholder.style.backgroundColor = '';
                            }, 3000);
                        }
                    }
                }, 100);

                // Фокус на элемент ввода если применимо
                setTimeout(() => {
                    if (fieldName === 'content' && editorRef.current) {
                        editorRef.current.focus();
                    } else if (fieldName !== 'image' && targetElement.focus) {
                        targetElement.focus();
                    }
                }, 150);
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
        // ✅ NEW: Очищаем все ошибки полей перед валидацией
        setFieldErrors({
            title: '',
            excerpt: '',
            content: '',
            category: '',
            image: ''
        });

        let hasErrors = false;

        if (!formData.title || formData.title.trim().length < 10) {
            setFieldErrors(prev => ({
                ...prev,
                title: 'Nadpis musí obsahovať minimálne 10 znakov'
            }));
            hasErrors = true;
        }

        if (!formData.excerpt || formData.excerpt.trim().length < 150) {
            setFieldErrors(prev => ({
                ...prev,
                excerpt: 'Perex musí obsahovať minimálne 150 znakov'
            }));
            hasErrors = true;
        }

        if (formData.excerpt.trim().length > 200) {
            setFieldErrors(prev => ({
                ...prev,
                excerpt: 'Perex môže obsahovať maximálne 200 znakov'
            }));
            hasErrors = true;
        }

        if (!formData.content || formData.content.trim() === '') {
            setFieldErrors(prev => ({
                ...prev,
                content: 'Obsah článku je povinný'
            }));
            hasErrors = true;
        }

        if (formData.content.trim().length < 500) {
            setFieldErrors(prev => ({
                ...prev,
                content: 'Obsah musí obsahovať minimálne 500 znakov'
            }));
            hasErrors = true;
        }

        if (!formData.category) {
            setFieldErrors(prev => ({
                ...prev,
                category: 'Kategória je povinná'
            }));
            hasErrors = true;
        }

        if (submitForReview && !selectedImage && !existingImage) {
            setFieldErrors(prev => ({
                ...prev,
                image: 'Obrázok je povinný pre odoslanie článku na moderáciu'
            }));
            hasErrors = true;
        }

        if (hasErrors) {
            // Фокусируемся на первой ошибке
            if (fieldErrors.title) focusOnError('title');
            else if (fieldErrors.excerpt) focusOnError('excerpt');
            else if (fieldErrors.category) focusOnError('category');
            else if (fieldErrors.content) focusOnError('content');
            else if (fieldErrors.image) focusOnError('image');
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
                result = await updateArticle(articleId, articleData, selectedImage);
            } else {
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
            const articleSlug = savedArticle.slug;

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
                        ? 'Článok bol úspešne upravený! Presmerúvame vás na náhľad...'
                        : 'Článok bol úspešne vytvorený ako koncept! Presmerúvame vás na náhľad...'
                });

                setTimeout(() => {
                    router.push(`/profil/moje-clanky/${articleSlug}/ukazka`);
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
                        {/* ✅ NEW: Отображение ошибки для title */}
                        {fieldErrors.title && (
                            <div className="new-article__field-error">
                                {fieldErrors.title}
                            </div>
                        )}
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
                        {/* ✅ NEW: Отображение ошибки для excerpt */}
                        {fieldErrors.excerpt && (
                            <div className="new-article__field-error">
                                {fieldErrors.excerpt}
                            </div>
                        )}
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
                        {/* ✅ NEW: Отображение ошибки для category */}
                        {fieldErrors.category && (
                            <div className="new-article__field-error">
                                {fieldErrors.category}
                            </div>
                        )}
                    </div>

                    {/* ✨ NEW: Загрузка изображения */}
                    <div className="new-article__field" ref={imageFieldRef}>
                        <label className="new-article__label">
                            Obrázok článku {!isEditMode && !existingImage && '(povinný pre moderáciu)'}
                        </label>

                        {/* Скрытый input */}
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                            disabled={loading}
                            id="article-image-input"
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

                        {/* ✅ NEW: Отображение ошибки для image */}
                        {fieldErrors.image && (
                            <div className="new-article__field-error">
                                {fieldErrors.image}
                            </div>
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
                        {/* ✅ NEW: Отображение ошибки для content */}
                        {fieldErrors.content && (
                            <div className="new-article__field-error">
                                {fieldErrors.content}
                            </div>
                        )}
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