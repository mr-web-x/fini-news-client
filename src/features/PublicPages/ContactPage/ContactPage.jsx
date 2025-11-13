"use client"

import { useState } from "react"
import { Mail, MapPin, Linkedin, Facebook, Send, Loader2 } from "lucide-react"
import "./ContactPage.scss"

const ContactPage = () => {
    const [formData, setFormData] = useState({
        meno: "",
        email: "",
        predmet: "",
        sprava: ""
    })

    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null

    // Валидация email
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    // Обработка изменений в полях
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Убираем ошибку при изменении поля
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }))
        }
    }

    // Валидация формы
    const validateForm = () => {
        const newErrors = {}

        if (!formData.meno.trim()) {
            newErrors.meno = "Meno je povinné"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email je povinný"
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = "Neplatný formát emailu"
        }

        if (!formData.predmet.trim()) {
            newErrors.predmet = "Predmet je povinný"
        }

        if (!formData.sprava.trim()) {
            newErrors.sprava = "Správa je povinná"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Отправка формы
    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitStatus(null)

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            // TODO: Здесь будет интеграция с backend TG сервисом
            // const response = await fetch('/api/contact', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // })

            // Временная заглушка
            console.log("📧 Отправка формы:", formData)

            // Симуляция отправки
            await new Promise(resolve => setTimeout(resolve, 1500))

            setSubmitStatus('success')
            setFormData({
                meno: "",
                email: "",
                predmet: "",
                sprava: ""
            })

            // Скрываем сообщение успеха через 5 секунд
            setTimeout(() => setSubmitStatus(null), 5000)

        } catch (error) {
            console.error("❌ Ошибка отправки:", error)
            setSubmitStatus('error')

            // Скрываем сообщение ошибки через 5 секунд
            setTimeout(() => setSubmitStatus(null), 5000)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="contact-page">
            <div className="container">
                <h1>Kontaktujte nás</h1>

                <div className="contact-grid">
                    {/* Левая колонка - контактная информация */}
                    <div className="contact-info">
                        <div className="info-section">
                            <h2>Napíšte nám na e-mail:</h2>
                            <a href="mailto:redakcia@fini.sk" className="contact-link">
                                <Mail size={20} />
                                <span>redakcia@fini.sk</span>
                            </a>
                        </div>

                        <div className="info-section">
                            <h2>Nájdete nás na adrese:</h2>
                            <div className="contact-link">
                                <MapPin size={20} />
                                <div>
                                    <p>Pekná cesta 2459, 831 52</p>
                                    <p>Bratislava, Rača</p>
                                </div>
                            </div>
                        </div>

                        <div className="info-section">
                            <h2>Sociálne siete</h2>
                            <div className="social-links">
                                <a href="https://www.linkedin.com/company/fastcredit-sk" target="_blank" rel="noopener noreferrer" className="social-link">
                                    <Linkedin size={24} />
                                </a>
                                <a href="https://www.facebook.com/profile.php?id=61581050981290" target="_blank" rel="noopener noreferrer" className="social-link">
                                    <Facebook size={24} />
                                </a>
                            </div>
                        </div>

                        {/* Для авторов и рекламодателей */}
                        <div className="info-section additional-contacts">
                            <div className="additional-item">
                                <h3>Chcete písať pre fini.sk?</h3>
                                <a href="mailto:autori@fini.sk" className="mailto-link">
                                    autori@fini.sk
                                </a>
                            </div>

                            <div className="additional-item">
                                <h3>Inzercia a partnerstvo</h3>
                                <a href="mailto:reklama@fini.sk" className="mailto-link">
                                    reklama@fini.sk
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка - форма обратной связи */}
                    <div className="contact-form-wrapper">
                        <h2>Napíšte nám</h2>

                        {submitStatus === 'success' && (
                            <div className="alert alert-success">
                                ✅ Správa bola úspešne odoslaná!
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className="alert alert-error">
                                ❌ Chyba pri odosielaní. Skúste prosím neskôr.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <label htmlFor="meno">Meno *</label>
                                <input
                                    type="text"
                                    id="meno"
                                    name="meno"
                                    value={formData.meno}
                                    onChange={handleChange}
                                    className={errors.meno ? "error" : ""}
                                    disabled={isLoading}
                                />
                                {errors.meno && <span className="error-message">{errors.meno}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? "error" : ""}
                                    disabled={isLoading}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="predmet">Predmet správy *</label>
                                <input
                                    type="text"
                                    id="predmet"
                                    name="predmet"
                                    value={formData.predmet}
                                    onChange={handleChange}
                                    className={errors.predmet ? "error" : ""}
                                    disabled={isLoading}
                                />
                                {errors.predmet && <span className="error-message">{errors.predmet}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="sprava">Správa *</label>
                                <textarea
                                    id="sprava"
                                    name="sprava"
                                    rows="6"
                                    value={formData.sprava}
                                    onChange={handleChange}
                                    className={errors.sprava ? "error" : ""}
                                    disabled={isLoading}
                                />
                                {errors.sprava && <span className="error-message">{errors.sprava}</span>}
                            </div>

                            <button type="submit" className="submit-btn" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="spinner" />
                                        <span>Odeosielam...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        <span>Odoslať</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Google Maps */}
                <div className="map-section">
                    <h2>Kde nás nájdete</h2>
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2659.441305144891!2d17.132494975960626!3d48.1981151469453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476c8e875982f33d%3A0xf8837846929b82ba!2sPekn%C3%A1%20cesta%202459%2C%20831%2052%20Ra%C4%8Da!5e0!3m2!1sru!2ssk!4v1763032708885!5m2!1sru!2ssk"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ContactPage