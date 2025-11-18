"use client"
import "./HeroSection.scss"

const HeroSection = () => {
    return (
        <section className="hero-section">
            <div className="container">
                <div className="hero-content">
                    <div className="hero-image">
                        <img
                            src="/images/placeholder.jpg"
                            alt="Hlavná správa dňa"
                            onError={(e) => {
                                // ✅ ДОБАВЛЯЕМ защиту от цикла
                                e.target.onerror = null;
                                e.target.src = '/icons/placeholder.svg'; // или другой fallback
                            }}
                        />
                    </div>
                    <div className="hero-text">
                        <span className="hero-category">Ekonomika</span>
                        <h1 className="hero-title">
                            Nová finančná reforma prinesie zmeny pre všetky slovenské banky
                        </h1>
                        <p className="hero-description">
                            Ministerstvo financií predstavilo komplexný balík opatrení, ktoré by mali vstúpiť do platnosti už v nasledujúcom štvrťroku...
                        </p>
                        <div className="hero-meta">
                            <span className="hero-author">Ján Novák</span>
                            <span className="hero-date">4. november 2025</span>
                            <span className="hero-time">5 min čítania</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection