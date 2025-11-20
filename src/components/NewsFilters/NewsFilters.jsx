// NewsFilters.jsx
"use client"
import { useRouter, useSearchParams } from "next/navigation"
import "./NewsFilters.scss"

const NewsFilters = ({ categories, selectedCategory, selectedSort }) => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const sortOptions = [
        { value: "createdAt", label: "Najnovšie" },
        { value: "views", label: "Najpopulárnejšie" }
    ]

    const handleCategoryChange = (categorySlug) => {
        const params = new URLSearchParams(searchParams.toString())

        if (categorySlug === "all") {
            params.delete("category")
        } else {
            params.set("category", categorySlug)
        }

        params.delete("page") // Reset to first page
        router.push(`/spravy?${params.toString()}`)
    }

    const handleSortChange = (sortValue) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("sortBy", sortValue)
        params.delete("page") // Reset to first page
        router.push(`/spravy?${params.toString()}`)
    }

    return (
        <div className="news-filters">
            {/* Category Tabs */}
            <div className="category-tabs">
                <button
                    className={`category-tab ${!selectedCategory ? "active" : ""}`}
                    onClick={() => handleCategoryChange("all")}
                >
                    Všetky
                </button>
                {categories.map((category) => (
                    <button
                        key={category._id}
                        className={`category-tab ${selectedCategory === category.slug ? "active" : ""}`}
                        onClick={() => handleCategoryChange(category.slug)}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Sort Dropdown */}
            <div className="sort-filter">
                <label htmlFor="sort-select">Zoradiť podľa:</label>
                <select
                    id="sort-select"
                    value={selectedSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="sort-select"
                >
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default NewsFilters