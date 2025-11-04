"use client"
import "./CategoriesGrid.scss"

const CategoriesGrid = () => {
    // Mock данные категорий с топ статьями
    const categories = [
        {
            id: 1,
            name: "Banky",
            slug: "banky",
            color: "#2563eb",
            icon: "🏦",
            articles: [
                {
                    id: 1,
                    title: "Slovenská sporiteľňa zvýšila úroky na hypotékach",
                    date: "3. november 2025",
                    views: 1245
                },
                {
                    id: 2,
                    title: "Tatra banka spúšťa novú mobilnú aplikáciu",
                    date: "1. november 2025",
                    views: 743
                },
                {
                    id: 3,
                    title: "VÚB banka mení poplatkový poriadok",
                    date: "30. október 2025",
                    views: 892
                }
            ]
        },
        {
            id: 2,
            name: "Úvery",
            slug: "uvery",
            color: "#7c3aed",
            icon: "💳",
            articles: [
                {
                    id: 4,
                    title: "Nové pravidlá pre spotrebiteľské úvery od 2026",
                    date: "3. november 2025",
                    views: 987
                },
                {
                    id: 5,
                    title: "Ako získať výhodný hypotekárny úver",
                    date: "2. november 2025",
                    views: 1432
                },
                {
                    id: 6,
                    title: "Porovnanie úrokových sadzieb bánk",
                    date: "1. november 2025",
                    views: 1156
                }
            ]
        },
        {
            id: 3,
            name: "Poistenie",
            slug: "poistenie",
            color: "#059669",
            icon: "🛡️",
            articles: [
                {
                    id: 7,
                    title: "Povinné ručenie zdražie o 15 percent",
                    date: "2. november 2025",
                    views: 2103
                },
                {
                    id: 8,
                    title: "Životné poistenie: čo treba vedieť",
                    date: "1. november 2025",
                    views: 654
                },
                {
                    id: 9,
                    title: "Poistenie nehnuteľnosti v roku 2026",
                    date: "30. október 2025",
                    views: 823
                }
            ]
        },
        {
            id: 4,
            name: "Dane",
            slug: "dane",
            color: "#dc2626",
            icon: "📊",
            articles: [
                {
                    id: 10,
                    title: "Daňové zmeny pre SZČO v roku 2026",
                    date: "2. november 2025",
                    views: 1567
                },
                {
                    id: 11,
                    title: "Daňové priznanie: termíny a povinnosti",
                    date: "1. november 2025",
                    views: 934
                },
                {
                    id: 12,
                    title: "DPH zmeny od januára 2026",
                    date: "29. október 2025",
                    views: 1289
                }
            ]
        },
        {
            id: 5,
            name: "Ekonomika",
            slug: "ekonomika",
            color: "#ea580c",
            icon: "📈",
            articles: [
                {
                    id: 13,
                    title: "Slovenská ekonomika rastie nad očakávania",
                    date: "1. november 2025",
                    views: 892
                },
                {
                    id: 14,
                    title: "Inflácia klesla na 3,2 percenta",
                    date: "31. október 2025",
                    views: 1123
                },
                {
                    id: 15,
                    title: "Nezamestnanosť na najnižšej úrovni",
                    date: "28. október 2025",
                    views: 756
                }
            ]
        }
    ]

    return (
        <section className="categories-grid">
            <div className="container">
                <div className="categories-header">
                    <h2 className="categories-title">Kategórie</h2>
                    <p className="categories-subtitle">
                        Sledujte najnovšie správy v jednotlivých oblastiach
                    </p>
                </div>
                <div className="categories-list">
                    {categories.map((category) => (
                        <div key={category.id} className="category-card">
                            <div className="category-header">
                                <div className="category-icon" style={{ backgroundColor: category.color }}>
                                    {category.icon}
                                </div>
                                <h3 className="category-name">{category.name}</h3>
                                <a
                                    href={`/spravy/${category.slug}`}
                                    className="category-link"
                                    style={{ color: category.color }}
                                >
                                    Všetky správy →
                                </a>
                            </div>
                            <div className="category-articles">
                                {category.articles.map((article, index) => (
                                    <article key={article.id} className="category-article">
                                        <div className="article-number">{index + 1}</div>
                                        <div className="article-info">
                                            <h4 className="article-title">{article.title}</h4>
                                            <div className="article-meta">
                                                <span className="article-date">{article.date}</span>
                                                <span className="article-views">{article.views} zobrazení</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default CategoriesGrid