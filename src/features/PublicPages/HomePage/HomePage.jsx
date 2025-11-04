"use client"
import "./HomePage.scss"
import HeroSection from "./HeroSection/HeroSection"
import LatestNews from "./LatestNews/LatestNews"
import CategoriesGrid from "./CategoriesGrid/CategoriesGrid"

const HomePage = () => {
    return (
        <div className="home-page">
            <HeroSection />
            <LatestNews />
            <CategoriesGrid />
        </div>
    )
}

export default HomePage