import "./CategoriesGrid.scss"
import CategoryCard from "@/components/CategoryCard/CategoryCard"

const CategoriesGrid = ({ categoriesData = [] }) => {
    return (
        <section className="categories-grid">
            <div className="container">
                <div className="categories-header">
                    <h2 className="categories-title">Kategórie</h2>
                    <p className="categories-subtitle">
                        Sledujte najnovšie správy v jednotlivých oblastiach
                    </p>
                </div>

                {categoriesData.length === 0 ? (
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