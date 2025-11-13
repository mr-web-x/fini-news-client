"use client"

import { Mail, MapPin, Linkedin, Facebook } from "lucide-react"
import ContactForm from "@/components/ContactForm/ContactForm"
import "./ContactPage.scss"

const ContactPage = () => {
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
                    <ContactForm />
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