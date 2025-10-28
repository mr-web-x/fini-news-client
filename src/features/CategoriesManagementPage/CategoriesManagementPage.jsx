"use client";

import { useState, useEffect } from "react";
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "@/actions/categories.actions";
import "./CategoriesManagementPage.scss";

const CategoriesManagementPage = ({ user }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Состояние для создания/редактирования категории
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' или 'edit'
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [formLoading, setFormLoading] = useState(false);

    // Поиск
    const [searchQuery, setSearchQuery] = useState('');

    // Загрузка категорий при монтировании
    useEffect(() => {
        loadCategories();
    }, []);

    // Загрузка категорий
    const loadCategories = async () => {
        setLoading(true);
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
                setMessage({
                    type: 'error',
                    text: result.message || 'Chyba pri načítaní kategórií'
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            setMessage({
                type: 'error',
                text: 'Neočakávaná chyba pri načítaní kategórií'
            });
        } finally {
            setLoading(false);
        }
    };

    // Открыть модалку для создания
    const openCreateModal = () => {
        setModalMode('create');
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setIsModalOpen(true);
    };

    // Открыть модалку для редактирования
    const openEditModal = (category) => {
        setModalMode('edit');
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        setIsModalOpen(true);
    };

    // Закрыть модалку
    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', description: '' });
        setEditingCategory(null);
    };

    // Обработка изменений в форме
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Создание категории
    const handleCreateCategory = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setMessage({
                type: 'error',
                text: 'Zadajte názov kategórie'
            });
            return;
        }

        if (formData.name.trim().length < 2) {
            setMessage({
                type: 'error',
                text: 'Názov kategórie musí obsahovať minimálne 2 znaky'
            });
            return;
        }

        setFormLoading(true);

        try {
            const result = await createCategory({
                name: formData.name.trim(),
                description: formData.description.trim()
            });

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: result.message || 'Kategória bola úspešne vytvorená!'
                });

                await loadCategories();
                closeModal();

                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 3000);
            } else {
                setMessage({
                    type: 'error',
                    text: result.message || 'Chyba pri vytváraní kategórie'
                });
            }
        } catch (error) {
            console.error('Error creating category:', error);
            setMessage({
                type: 'error',
                text: 'Neočakávaná chyba pri vytváraní kategórie'
            });
        } finally {
            setFormLoading(false);
        }
    };

    // Обновление категории
    const handleUpdateCategory = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setMessage({
                type: 'error',
                text: 'Zadajte názov kategórie'
            });
            return;
        }

        if (formData.name.trim().length < 2) {
            setMessage({
                type: 'error',
                text: 'Názov kategórie musí obsahovať minimálne 2 znaky'
            });
            return;
        }

        setFormLoading(true);

        try {
            const result = await updateCategory(editingCategory._id, {
                name: formData.name.trim(),
                description: formData.description.trim()
            });

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: result.message || 'Kategória bola úspešne aktualizovaná!'
                });

                await loadCategories();
                closeModal();

                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 3000);
            } else {
                setMessage({
                    type: 'error',
                    text: result.message || 'Chyba pri aktualizácii kategórie'
                });
            }
        } catch (error) {
            console.error('Error updating category:', error);
            setMessage({
                type: 'error',
                text: 'Neočakávaná chyba pri aktualizácii kategórie'
            });
        } finally {
            setFormLoading(false);
        }
    };

    // Удаление категории
    const handleDeleteCategory = async (categoryId, categoryName) => {
        const confirmed = window.confirm(
            `Naozaj chcete odstrániť kategóriu "${categoryName}"?\n\nPozor: Táto akcia je nevratná!`
        );

        if (!confirmed) return;

        try {
            const result = await deleteCategory(categoryId);

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: result.message || 'Kategória bola úspešne odstránená!'
                });

                await loadCategories();

                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 3000);
            } else {
                setMessage({
                    type: 'error',
                    text: result.message || 'Chyba pri odstraňovaní kategórie'
                });
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            setMessage({
                type: 'error',
                text: 'Neočakávaná chyba pri odstraňovaní kategórie'
            });
        }
    };

    // Фильтрация категорий по поиску
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="categories-management">
            <div className="categories-management__header">
                <div>
                    <h1>Správa kategórií</h1>
                    <p>Spravujte kategórie pre články</p>
                </div>
                <button
                    className="categories-management__btn categories-management__btn--primary"
                    onClick={openCreateModal}
                >
                    ➕ Pridať kategóriu
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`categories-management__message categories-management__message--${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Поиск */}
            <div className="categories-management__search">
                <input
                    type="text"
                    placeholder="🔍 Hľadať kategóriu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="categories-management__search-input"
                />
            </div>

            {/* Список категорий */}
            {loading ? (
                <div className="categories-management__loading">
                    Načítavanie kategórií...
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="categories-management__empty">
                    {searchQuery ?
                        'Nenašli sa žiadne kategórie podľa vášho vyhľadávania.' :
                        'Zatiaľ neboli vytvorené žiadne kategórie.'
                    }
                </div>
            ) : (
                <div className="categories-management__table-wrapper">
                    <table className="categories-management__table">
                        <thead>
                            <tr>
                                <th>Názov</th>
                                <th>Slug</th>
                                <th>Popis</th>
                                <th>Vytvorené</th>
                                <th>Akcie</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((category) => (
                                <tr key={category._id}>
                                    <td>
                                        <strong>{category.name}</strong>
                                    </td>
                                    <td>
                                        <code>{category.slug}</code>
                                    </td>
                                    <td>
                                        {category.description ? (
                                            <span className="categories-management__description">
                                                {category.description.length > 60
                                                    ? `${category.description.substring(0, 60)}...`
                                                    : category.description
                                                }
                                            </span>
                                        ) : (
                                            <span className="categories-management__no-description">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {new Date(category.createdAt).toLocaleDateString('sk-SK')}
                                    </td>
                                    <td>
                                        <div className="categories-management__actions">
                                            <button
                                                className="categories-management__btn categories-management__btn--edit"
                                                onClick={() => openEditModal(category)}
                                                title="Upraviť"
                                            >
                                                ✏️ Upraviť
                                            </button>
                                            <button
                                                className="categories-management__btn categories-management__btn--delete"
                                                onClick={() => handleDeleteCategory(category._id, category.name)}
                                                title="Odstrániť"
                                            >
                                                🗑️ Odstrániť
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Модальное окно для создания/редактирования */}
            {isModalOpen && (
                <div className="categories-management__modal-overlay" onClick={closeModal}>
                    <div className="categories-management__modal" onClick={(e) => e.stopPropagation()}>
                        <div className="categories-management__modal-header">
                            <h2>
                                {modalMode === 'create' ? 'Pridať novú kategóriu' : 'Upraviť kategóriu'}
                            </h2>
                            <button
                                className="categories-management__modal-close"
                                onClick={closeModal}
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            className="categories-management__modal-form"
                            onSubmit={modalMode === 'create' ? handleCreateCategory : handleUpdateCategory}
                        >
                            <div className="categories-management__modal-field">
                                <label htmlFor="name">Názov kategórie *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Napríklad: Technológie"
                                    disabled={formLoading}
                                    required
                                />
                            </div>

                            <div className="categories-management__modal-field">
                                <label htmlFor="description">Popis (voliteľný)</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Krátky popis kategórie..."
                                    rows="4"
                                    disabled={formLoading}
                                />
                            </div>

                            <div className="categories-management__modal-actions">
                                <button
                                    type="button"
                                    className="categories-management__btn categories-management__btn--secondary"
                                    onClick={closeModal}
                                    disabled={formLoading}
                                >
                                    Zrušiť
                                </button>
                                <button
                                    type="submit"
                                    className="categories-management__btn categories-management__btn--primary"
                                    disabled={formLoading}
                                >
                                    {formLoading ? 'Ukladanie...' :
                                        modalMode === 'create' ? 'Vytvoriť' : 'Uložiť'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesManagementPage;