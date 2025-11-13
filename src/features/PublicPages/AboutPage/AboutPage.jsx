"use client"

import "./AboutPage.scss"
import Link from "next/link"

const AboutPage = () => {
    return (
        <main className="about-page">
            <div className="container">
                <h1>O nás</h1>

                {/* Naša misia */}
                <section className="about-section">
                    <h2>Naša misia</h2>
                    <div className="content-grid">
                        <div className="text-content">
                            <p>
                                Fini.sk vznikol ako odpoveď na potrebu spoľahlivého a nezávislého finančného média na Slovensku.
                                Našou hlavnou úlohou je prinášať kvalitné, aktuálne a zrozumiteľné finančné informácie pre všetkých,
                                ktorí sa chcú orientovať vo svete financií.
                            </p>
                            <p>
                                Riešime problém nedostatku dôveryhodných finančných zdrojov v slovenskom jazyku,
                                ktoré by komplexne pokrývali všetky oblasti financií - od osobných financií až po makroekonomické trendy.
                            </p>
                            <div className="values-preview">
                                <h3>Naše hodnoty</h3>
                                <ul>
                                    <li>Nezávislosť a objektivita</li>
                                    <li>Odbornosť a presnosť</li>
                                    <li>Zrozumiteľnosť a prístupnosť</li>
                                    <li>Aktuálnosť a relevantnosť</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* História */}
                <section className="about-section">
                    <h2>História</h2>
                    <div className="content-grid">
                        <div className="text-content">
                            <p>
                                Portál Fini.sk bol založený v roku 2023 s cieľom vytvoriť moderný finančný portál,
                                ktorý by spĺňal najvyššie štandardy finančného spravodajstva.
                            </p>
                            <div className="milestones">
                                <h3>Kľúčové míľniky</h3>
                                <ul>
                                    <li>
                                        <strong>2023</strong> - Založenie portálu a spustenie prvej verzie
                                    </li>
                                    <li>
                                        <strong>2024</strong> - Rozšírenie redakčného tímu a spustenie mobilnej aplikácie
                                    </li>
                                    <li>
                                        <strong>Súčasnosť</strong> - Jedna z najnavštevovanejších finančných stránok na Slovensku
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Redakcia */}
                <section className="about-section">
                    <h2>Redakcia</h2>
                    <div className="content-grid">
                        <div className="text-content">
                            <p>
                                Náš tím tvoria skúsení finanční novinári, analytici a odborníci z praxe,
                                ktorí majú hlboké znalosti finančného trhu a schopnosť zložité témy vysvetliť
                                zrozumiteľne pre širokú verejnosť.
                            </p>
                            <p>
                                Veríme, že kvalitné finančné spravodajstvo by malo byť prístupné každému,
                                bez ohľadu na úroveň finančných znalostí.
                            </p>
                            <div className="cta-link">
                                <Link href="/autori" className="link-button">
                                    Pozrite si celý tím autorov →
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Čo pokrývame */}
                <section className="about-section">
                    <h2>Čo pokrývame</h2>
                    <div className="coverage-grid">
                        <div className="coverage-category">
                            <h3>Bankový sektor</h3>
                            <ul>
                                <li>Bežné a sporiace účty</li>
                                <li>Hypotekárne a úverové produkty</li>
                                <li>Investičné produkty bánk</li>
                                <li>Bankové poplatky a podmienky</li>
                            </ul>
                        </div>

                        <div className="coverage-category">
                            <h3>Úvery a hypotéky</h3>
                            <ul>
                                <li>Hypotekárne úvery a refinancovanie</li>
                                <li>Spotrebiteľské úvery</li>
                                <li>Úrokové sadzby a podmienky</li>
                                <li>Porovnanie úverových ponúk</li>
                            </ul>
                        </div>

                        <div className="coverage-category">
                            <h3>Poistenie</h3>
                            <ul>
                                <li>Životné poistenie</li>
                                <li>Majetkové poistenie</li>
                                <li>Cestovné poistenie</li>
                                <li>Investičné životné poistenie</li>
                            </ul>
                        </div>

                        <div className="coverage-category">
                            <h3>Dane a právne otázky</h3>
                            <ul>
                                <li>Daňové priznania a odvody</li>
                                <li>Daňové úľavy a príležitosti</li>
                                <li>Právne aspekty investovania</li>
                                <li>Zmeny v daňovej legislatíve</li>
                            </ul>
                        </div>

                        <div className="coverage-category">
                            <h3>Makroekonómia Slovenska</h3>
                            <ul>
                                <li>Hospodársky vývoj a prognózy</li>
                                <li>Inflácia a menová politika</li>
                                <li>Trh práce a nezamestnanosť</li>
                                <li>Rozpočet a hospodárenie štátu</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Naše hodnoty */}
                <section className="about-section">
                    <h2>Naše hodnoty</h2>
                    <div className="values-grid">
                        <div className="value-item">
                            <h3>Nezávislosť</h3>
                            <p>
                                Naša redakcia je nezávislá a riadi sa výlučne profesionálnymi a etickými štandardmi.
                                Nepodliehame komerčným ani politickým vplyvom.
                            </p>
                        </div>

                        <div className="value-item">
                            <h3>Odbornosť</h3>
                            <p>
                                Všetky naše články vychádzajú z dôkladného výskumu a overených zdrojov.
                                Spolupracujeme so špičkovými odborníkmi z jednotlivých oblastí.
                            </p>
                        </div>

                        <div className="value-item">
                            <h3>Transparentnosť</h3>
                            <p>
                                Jasne uvádzame zdroje informácií a metodiku našich analýz.
                                Pripadné konflikty záujmov sú vždy transparentne oznámené.
                            </p>
                        </div>

                        <div className="value-item">
                            <h3>Aktuálnosť</h3>
                            <p>
                                Prinášame správy v reálnom čase a pružne reagujeme na dôležité udalosti
                                vo svete financií, ktoré ovplyvňujú naše čitateľov.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Kontakt */}
                <section className="about-section">
                    <h2>Kontakt</h2>
                    <div className="content-grid">
                        <div className="text-content">
                            <p>
                                Máte otázky, návrhy alebo námety? Radi vás vypočujeme a odpovieme.
                            </p>
                            <div className="contact-info">
                                <p>
                                    <strong>E-mail redakcie:</strong> redakcia@fini.sk
                                </p>
                                <p>
                                    Pre komplexné kontaktné informácie a kontaktný formulár navštívte našu kontaktnú stránku.
                                </p>
                                <div className="cta-link">
                                    <Link href="/kontakt" className="link-button">
                                        Prejsť na kontaktnú stránku →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Právne informácie */}
                <section className="about-section legal-section">
                    <h2>Právne informácie</h2>
                    <div className="legal-grid">
                        <div className="legal-info">
                            <h3>Fini.sk s.r.o.</h3>
                            <div className="legal-details">
                                <p><strong>IČO:</strong> 12 345 678</p>
                                <p><strong>DIČ:</strong> 1234567890</p>
                                <p><strong>IČ DPH:</strong> SK1234567890</p>
                                <p><strong>Adresa:</strong> Hlavná 1, 811 01 Bratislava</p>
                                <p><strong>Zodpovedný redaktor:</strong> Ján Novák</p>
                            </div>
                        </div>

                        <div className="legal-notice">
                            <p>
                                <strong>Právne upozornenie:</strong> Všetky informácie na tomto portáli sú
                                informatívneho charakteru a nie sú investičným poradenstvom.
                                Pred akýmkoľvek investičným rozhodnutím odporúčame konzultáciu s odborným poradcom.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}

export default AboutPage