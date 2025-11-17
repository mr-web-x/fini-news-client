"use client";
import "./Sidebar.scss";
import Link from "next/link";
import Image from "next/image";
import { getArticleImageUrl } from "@/utils/imageHelpers";

const Sidebar = ({ topArticles = [] }) => {
    return (
        <aside className="sidebar">
            {/* Топ статьи */}
            <div className="sidebar-block">
                <h3 className="sidebar-block__title">Najpopulárnejšie články</h3>
                <div className="sidebar-articles">
                    {topArticles.length === 0 ? (
                        <p className="sidebar-empty">Žiadne populárne články</p>
                    ) : (
                        topArticles.map((article, index) => (
                            <Link
                                key={article._id}
                                href={`/spravy/${article.slug}`}
                                className="sidebar-article"
                            >
                                <div className="sidebar-article__number">{index + 1}</div>

                                {/* ✨ NEW: Article Image */}
                                {article.coverImage && (
                                    <div className="sidebar-article__image">
                                        <Image
                                            src={getArticleImageUrl(article.coverImage)}
                                            alt={article.title}
                                            width={80}
                                            height={60}
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                )}

                                <div className="sidebar-article__content">
                                    <h4 className="sidebar-article__title">{article.title}</h4>
                                    <div className="sidebar-article__meta">
                                        <span>{article.views || 0} zobrazení</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Newsletter подписка */}
            {/* <div className="sidebar-block sidebar-block--newsletter">
                <h3 className="sidebar-block__title">Prihláste sa k odberu</h3>
                <p className="sidebar-block__text">
                    Získajte najnovšie finančné správy priamo do svojej e-mailovej schránky
                </p>
                <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="email"
                        placeholder="Váš e-mail"
                        className="newsletter-form__input"
                        required
                    />
                    <button type="submit" className="newsletter-form__button">
                        Prihlásiť sa
                    </button>
                </form>
            </div> */}

            {/* Рекламный блок */}
            <div className="sidebar-block sidebar-block--ad">
                <p className="sidebar-ad__label">Reklama</p>
                <div className="sidebar-ad">
                    <p>Reklamný priestor</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;