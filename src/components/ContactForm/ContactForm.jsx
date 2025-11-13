"use client"

import { useState } from "react"
import { Send, Loader2 } from "lucide-react"
import { sendContactMessage } from "@/actions/sendMessage.action"
import "./ContactForm.scss"

const ContactForm = () => {
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
            console.log("📧 Отправка формы:", formData)

            // Вызываем Server Action
            const result = await sendContactMessage(formData)

            if (result.success) {
                setSubmitStatus('success')

                // Очищаем форму
                setFormData({
                    meno: "",
                    email: "",
                    predmet: "",
                    sprava: ""
                })

                // Скрываем сообщение успеха через 5 секунд
                setTimeout(() => setSubmitStatus(null), 5000)
            } else {
                setSubmitStatus('error')
                console.error('Ошибка:', result.message)

                // Скрываем сообщение ошибки через 5 секунд
                setTimeout(() => setSubmitStatus(null), 5000)
            }

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
    )
}

export default ContactForm