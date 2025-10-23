"use client";

import { useState } from "react";
import { updateProfile } from '@/actions/auth.actions';
import "./SettingsPage.scss";

const SettingsPage = ({ user }) => {
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        bio: user?.bio || '',
        position: user?.position || ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await updateProfile(user.id, formData);

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Profil bol úspešne aktualizovaný!'
                });

                // Обновляем страницу через 2 секунды
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setMessage({
                    type: 'error',
                    text: result.message || 'Chyba pri aktualizácii profilu'
                });
            }
        } catch (error) {
            console.error('Settings update error:', error);
            setMessage({
                type: 'error',
                text: 'Neočakávaná chyba pri aktualizácii'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="settings__header">
                <h1>Nastavenia profilu</h1>
                <p>Upravte si osobné údaje a informácie o vašom profile</p>
            </div>

            <div className="settings__content">
                {/* User Avatar Section */}
                <div className="settings__avatar-section">
                    <div className="settings__avatar">
                        <img
                            src={user?.avatar || "/icons/user-placeholder.svg"}
                            alt="User avatar"
                        />
                    </div>
                    <div className="settings__avatar-info">
                        <h3>{user?.displayName || 'Používateľ'}</h3>
                        <p>{user?.email}</p>
                        <span className="settings__role-badge">
                            {user?.role === 'user' && 'Používateľ'}
                            {user?.role === 'author' && 'Autor'}
                            {user?.role === 'admin' && 'Administrátor'}
                        </span>
                    </div>
                </div>

                {/* Settings Form */}
                <form onSubmit={handleSubmit} className="settings__form">

                    {/* Message */}
                    {message.text && (
                        <div className={`settings__message settings__message--${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Display Name */}
                    <div className="settings__field">
                        <label htmlFor="displayName" className="settings__label">
                            Zobrazované meno *
                        </label>
                        <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            className="settings__input"
                            placeholder="Vaše zobrazované meno"
                            required
                        />
                    </div>

                    {/* First Name */}
                    <div className="settings__field">
                        <label htmlFor="firstName" className="settings__label">
                            Meno
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="settings__input"
                            placeholder="Vaše krstné meno"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="settings__field">
                        <label htmlFor="lastName" className="settings__label">
                            Priezvisko
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="settings__input"
                            placeholder="Vaše priezvisko"
                        />
                    </div>

                    {/* Position */}
                    <div className="settings__field">
                        <label htmlFor="position" className="settings__label">
                            Pozícia / Profesia
                        </label>
                        <input
                            type="text"
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            className="settings__input"
                            placeholder="Napr. Frontend Developer, Novinár, Študent..."
                        />
                    </div>

                    {/* Bio */}
                    <div className="settings__field">
                        <label htmlFor="bio" className="settings__label">
                            O mne
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            className="settings__textarea"
                            placeholder="Napíšte niečo o sebe..."
                            rows="4"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="settings__actions">
                        <button
                            type="submit"
                            className="settings__save-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="settings__spinner"></span>
                                    Ukladám...
                                </>
                            ) : (
                                'Uložiť zmeny'
                            )}
                        </button>
                    </div>
                </form>

                {/* Account Info */}
                <div className="settings__account-info">
                    <h3>Informácie o účte</h3>
                    <div className="settings__info-item">
                        <span className="settings__info-label">Email:</span>
                        <span className="settings__info-value">{user?.email}</span>
                    </div>
                    <div className="settings__info-item">
                        <span className="settings__info-label">Registrovaný:</span>
                        <span className="settings__info-value">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('sk-SK') : '15.01.2025'}
                        </span>
                    </div>
                    <div className="settings__info-item">
                        <span className="settings__info-label">Typ účtu:</span>
                        <span className="settings__info-value">Google OAuth</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;