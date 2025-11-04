"use client"
import "./LatestNews.scss"

const LatestNews = () => {
    // Mock данные последних новостей
    const news = [
        {
            id: 1,
            title: "Slovenská sporiteľňa zvýšila úroky na hypotékach",
            excerpt: "Najväčšia slovenská banka reaguje na zmeny na finančnom trhu a upravuje úrokové sadzby pre nové hypotéky...",
            category: "Banky",
            author: "Peter Horváth",
            date: "3. november 2025",
            readTime: "4 min",
            image: "/images/placeholder.jpg",
            views: 1245
        },
        {
            id: 2,
            title: "Nové pravidlá pre spotrebiteľské úvery od 2026",
            excerpt: "Národná banka Slovenska pripravila nové regulácie, ktoré ovplyvnia podmienky poskytovania spotrebných úverov...",
            category: "Úvery",
            author: "Mária Kováčová",
            date: "3. november 2025",
            readTime: "6 min",
            image: "/images/placeholder.jpg",
            views: 987
        },
        {
            id: 3,
            title: "Povinné ručenie zdražie o 15 percent",
            excerpt: "Poisťovne oznámili zvýšenie cien povinného zmluvného poistenia pre motorové vozidlá na budúci rok...",
            category: "Poistenie",
            author: "Ján Novák",
            date: "2. november 2025",
            readTime: "3 min",
            image: "/images/placeholder.jpg",
            views: 2103
        },
        {
            id: 4,
            title: "Daňové zmeny pre SZČO v roku 2026",
            excerpt: "Ministerstvo financií schválilo balík opatrení, ktoré zmenia daňové zaťaženie samostatne zárobkovo činných osôb...",
            category: "Dane",
            author: "Eva Šimková",
            date: "2. november 2025",
            readTime: "5 min",
            image: "/images/placeholder.jpg",
            views: 1567
        },
        {
            id: 5,
            title: "Slovenská ekonomika rastie nad očakávania",
            excerpt: "Štatistický úrad zverejnil údaje o raste HDP, ktorý prekvapil analytikov pozitívnym vývojom...",
            category: "Ekonomika",
            author: "Tomáš Varga",
            date: "1. november 2025",
            readTime: "7 min",
            image: "/images/placeholder.jpg",
            views: 892
        },
        {
            id: 6,
            title: "Tatra banka spúšťa novú mobilnú aplikáciu",
            excerpt: "Modernizovaná aplikácia prináša vylepšené funkcie a jednoduchšie ovládanie pre klientov banky...",
            category: "Banky",
            author: "Peter Horváth",
            date: "1. november 2025",
            readTime: "4 min",
            image: "/images/placeholder.jpg",
            views: 743
        }
    ]

    return (
        <section className="latest-news">
            <div className="container">
                <div className="latest-news-header">
                    <h2 className="latest-news-title">Najnovšie správy</h2>
                    <a href="/spravy" className="latest-news-link">
                        Zobraziť všetky →
                    </a>
                </div>
                <div className="news-grid">
                    {news.map((article) => (
                        <article key={article.id} className="news-card">
                            <div className="news-card-image">
                                <img src={article.image} alt={article.title} />
                                <span className="news-card-category">{article.category}</span>
                            </div>
                            <div className="news-card-content">
                                <h3 className="news-card-title">{article.title}</h3>
                                <p className="news-card-excerpt">{article.excerpt}</p>
                                <div className="news-card-meta">
                                    <span className="news-card-author">{article.author}</span>
                                    <span className="news-card-date">{article.date}</span>
                                    <span className="news-card-time">{article.readTime}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default LatestNews