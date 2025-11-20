"use client";
import "./Footer.scss";
import Image from "next/image";
import { Mail } from "lucide-react";

const Footer = () => {
    return (
        <footer id="contacts">
            <div className="footer-container">
                <div className="footer__wrapper">
                    <div className="footer__top">
                        <div className="footer__top-left">
                            <a href="/" className="logo">
                                <Image
                                    src="/icons/logo.svg"
                                    alt="logo"
                                    width={40}
                                    height={40}
                                />
                                <span>Fini</span>
                            </a>

                            <p>Rýchla pôžička online</p>
                        </div>

                        <div className="footer__top-right">
                            <div className="footer__top-right-card"></div>
                            <div className="footer__top-right-card"></div>

                            <div className="footer__top-right-card">
                                <a href="mailto:support@walletroom.online">
                                    <Mail size={70} color="#777777" />
                                    <span>support@walletroom.online</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="footer__bottom">
                        <div className="footer__bottom-left">
                            <nav className="footer__menu">
                                <a href="https://fini.sk/">Domov</a>
                                <a href="https://fini.sk/">Časté otázky</a>
                                <a href="https://fini.sk/kontakty.html">Kontakt</a>
                                <a href="https://fini.sk/#cc-credit-calculator">Požiadať o pôžičku</a>
                                <a href="https://fastcredit.sk/forum/" target="_blank">
                                    FastCredit Forum
                                </a>
                                <a href="https://fini.sk/investor.html">Registrácia investora</a>
                            </nav>
                        </div>

                        <div className="footer__bottom-right">
                            <a href="/platform-terms.html">Pravidlá a podmienky</a>
                            <p className="cookies-open-btn">Zmena nastavenia cookies</p>
                            <p>© 2025 - Všetky práva vyhradené</p>
                            <div className="footer__bottom-right-back"></div>
                        </div>
                    </div>

                    <div className="footer__infos">
                        <p>
                            Platforma Fini.sk je informačný portál a nevykonáva činnosti,
                            ktoré si vyžadujú licenciu na poskytovanie finančných služieb.
                            Používaním Fini.sk uzatvárate obchody týkajúce sa kúpy alebo
                            predaja pohľadávok vyplývajúcich zo zmlúv o pôžičke. Takéto
                            operácie sú spojené s rizikom nevrátenia alebo čiastočného
                            nevrátenia finančných prostriedkov. Pred uzatvorením obchodov
                            dôkladne zvážte možné ризикá.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
