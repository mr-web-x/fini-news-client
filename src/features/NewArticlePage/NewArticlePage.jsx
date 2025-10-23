"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./NewArticlePage.scss";

const NewArticlePage = ({ user }) => {
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        featuredImage: null,
        category: '',
        tags: '',
        status: 'draft' // draft, pending
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [imagePreview, setImagePreview] = useState(null);

    // Predefined categories
    const categories = [
        'Bankovníctvo',
        'Úvery a hypotéky',
        'Poisťovníctvo', 
        'Dane a účtovníctvo',
        'Investície',
        'Kryptomeny',
        'Ekonomika',
        'Finančné plánovanie',
        'Podnikanie',
        'Technológie vo financiách'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

            setFormData(prev => ({
                ...prev,
                featuredImage: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            featuredImage: null
        }));
        setImagePreview(null);
        // Clear file input
        document.getElementById('featuredImage').value = '';
    };

    const handleContentChange = (content) => {
        setFormData(prev => ({
            ...prev,
            content
        }));
    };

    const handleSave = async (status) => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Basic validation
        if (!formData.title.trim()) {
            setMessage({ type: 'error', text: 'Nadpis je povinný' });
            setLoading(false);
            return;
        }

        if (!formData.excerpt.trim()) {
            setMessage({ type: 'error', text: 'Perex je povinný' });
            setLoading(false);
            return;
        }

        if (!formData.content.trim()) {
            setMessage({ type: 'error', text: 'Obsah článku je povinný' });
            setLoading(false);
            return;
        }

        if (!formData.category) {
            setMessage({ type: 'error', text: 'Kategória je povinná' });
            setLoading(false);
            return;
        }

        try {
            // Prepare form data for submission
            const submitData = new FormData();
            submitData.append('title', formData.title.trim());
            submitData.append('excerpt', formData.excerpt.trim());
            submitData.append('content', formData.content);
            submitData.append('category', formData.category);
            submitData.append('tags', formData.tags.trim());
            submitData.append('status', status);
            submitData.append('authorId', user.id);

            if (formData.featuredImage) {
                submitData.append('featuredImage', formData.featuredImage);
            }

            // TODO: Replace with actual API call
            // const result = await createArticle(submitData);
            
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            if (status === 'draft') {
                setMessage({ 
                    type: 'success', 
                    text: 'Článok bol uložený ako koncept' 
                });
                // Reset form
                setFormData({
                    title: '',
                    excerpt: '',
                    content: '',
                    featuredImage: null,
                    category: '',
                    tags: '',
                    status: 'draft'
                });
                setImagePreview(null);
            } else {
                setMessage({ 
                    type: 'success', 
                    text: 'Článok bol odoslaný na moderáciu' 
                });
                // Redirect to articles list
                setTimeout(() => {
                    router.push('/profil/moje-clanky');
                }, 2000);
            }
            
        } catch (error) {
            console.error('Error saving article:', error);
            setMessage({ 
                type: 'error', 
                text: 'Chyba pri ukladaní článku' 
            });
        } finally {
            setLoading(false);
        }
    };

    const getCharacterCount = (text, limit) => {
        const count = text.length;
        const remaining = limit - count;
        const isOverLimit = remaining < 0;
        
        return {
            count,
            remaining,
            isOverLimit,
            className: isOverLimit ? 'character-count--error' : 
                       remaining < 20 ? 'character-count--warning' : 
                       'character-count--normal'
        };
    };

    const titleCount = getCharacterCount(formData.title, 100);
    const excerptCount = getCharacterCount(formData.excerpt, 300);

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
                            maxLength="120"
                        />
                        <div className={`character-count ${titleCount.className}`}>
                            {titleCount.count}/100 znakov
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
                            placeholder="Napíšte krátky popis článku, ktorý sa zobrazí v náhľade..."
                            rows="3"
                            maxLength="320"
                        />
                        <div className={`character-count ${excerptCount.className}`}>
                            {excerptCount.count}/300 znakov
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
                        >
                            <option value="">Vyberte kategóriu</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tags */}
                    <div className="new-article__field">
                        <label htmlFor="tags" className="new-article__label">
                            Tagy (oddelené čiarkou)
                        </label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            className="new-article__input"
                            placeholder="hypotéka, úroky, banka, refinancovanie..."
                        />
                    </div>

                    {/* Featured Image */}
                    <div className="new-article__field">
                        <label htmlFor="featuredImage" className="new-article__label">
                            Hlavný obrázok
                        </label>
                        <div className="new-article__image-upload">
                            {imagePreview ? (
                                <div className="new-article__image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="new-article__remove-image"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="new-article__upload-area">
                                    <div className="new-article__upload-icon">📷</div>
                                    <p>Kliknite pre nahratie obrázka</p>
                                    <small>JPG, PNG, max 5MB</small>
                                </div>
                            )}
                            <input
                                type="file"
                                id="featuredImage"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="new-article__file-input"
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
                                placeholder="Napíšte obsah článku..."
                                rows="15"
                            />
                            <div className="new-article__editor-note">
                                <small>💡 Tip: Používajte odsady a prázdne riadky pre lepšiu čitateľnosť</small>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="new-article__actions">
                        <button
                            type="button"
                            onClick={() => handleSave('draft')}
                            disabled={loading}
                            className="new-article__btn new-article__btn--draft"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Ukladám...
                                </>
                            ) : (
                                <>
                                    💾 Uložiť ako koncept
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSave('pending')}
                            disabled={loading}
                            className="new-article__btn new-article__btn--publish"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Odosielam...
                                </>
                            ) : (
                                <>
                                    🚀 Odoslať na moderáciu
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default NewArticlePage;