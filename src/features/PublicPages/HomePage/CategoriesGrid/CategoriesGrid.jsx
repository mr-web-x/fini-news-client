"use client"
import "./CategoriesGrid.scss"
import { useState, useEffect } from "react"
import CategoryCard from "@/components/CategoryCard/CategoryCard"
import { getAllCategories } from "@/actions/categories.actions"
import { getAllArticles } from "@/actions/articles.actions"

const CategoriesGrid = () => {
    const [categoriesData, setCategoriesData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Дефолтные иконки и цвета для категорий
    const categoryStyles = {
        "banky": { icon: "🏦", color: "#2563eb" },
        "uvery": { icon: "💳", color: "#7c3aed" },
        "poistenie": { icon: "🛡️", color: "#059669" },
        "dane": { icon: "📊", color: "#dc2626" },
        "ekonomika": { icon: "📈", color: "#ea580c" }
    }

    useEffect(() => {
        const fetchCategoriesWithArticles = async () => {
            try {
                // 1. Получаем все категории
                const categoriesResult = await getAllCategories()

                if (!categoriesResult.success) {
                    setError(categoriesResult.message || "Nepodarilo sa načítať kategórie")
                    setLoading(false)
                    return
                }

                // Обрабатываем разные структуры ответа
                let categories = []
                if (Array.isArray(categoriesResult.data)) {
                    categories = categoriesResult.data
                } else if (categoriesResult.data?.data && Array.isArray(categoriesResult.data.data)) {
                    categories = categoriesResult.data.data
                } else if (categoriesResult.data?.categories && Array.isArray(categoriesResult.data.categories)) {
                    categories = categoriesResult.data.categories
                }

                console.log('Categories loaded:', categories) // для отладки

                // 2. Для каждой категории получаем топ 3 статьи
                const categoriesWithArticles = await Promise.all(
                    categories.map(async (category) => {
                        try {
                            const articlesResult = await getAllArticles({
                                category: category.slug,
                                limit: 3,
                                sort: '-views' // сортировка по просмотрам
                            })

                            const articles = articlesResult.success
                                ? (articlesResult.data?.articles || articlesResult.data || [])
                                : []

                            // Добавляем стили (иконка и цвет) для категории
                            const style = categoryStyles[category.slug] || { icon: "📰", color: "#2563eb" }

                            return {
                                ...category,
                                icon: style.icon,
                                color: style.color,
                                articles: articles
                            }
                        } catch (err) {
                            console.error(`Error loading articles for ${category.slug}:`, err)
                            return {
                                ...category,
                                articles: []
                            }
                        }
                    })
                )

                setCategoriesData(categoriesWithArticles)
            } catch (err) {
                setError(err.message || "Chyba pri načítaní kategórií")
            } finally {
                setLoading(false)
            }
        }

        fetchCategoriesWithArticles()
    }, [])

    return (
        <section className="categories-grid">
            <div className="container">
                <div className="categories-header">
                    <h2 className="categories-title">Kategórie</h2>
                    <p className="categories-subtitle">
                        Sledujte najnovšie správy v jednotlivých oblastiach
                    </p>
                </div>

                {loading ? (
                    <div className="categories-loader">
                        <div className="spinner"></div>
                        <p>Načítavanie kategórií...</p>
                    </div>
                ) : error ? (
                    <div className="categories-error">
                        <p>{error}</p>
                    </div>
                ) : categoriesData.length === 0 ? (
                    <div className="categories-empty">
                        <p>Zatiaľ nie sú dostupné žiadne kategórie</p>
                    </div>
                ) : (
                    <div className="categories-list">
                        {categoriesData.map((category) => (
                            <CategoryCard
                                key={category._id}
                                category={category}
                                articles={category.articles}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default CategoriesGrid