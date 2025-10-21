"use client"
import "./Header.scss"
import Link from "next/link"
import Image from "next/image"

const Header = () => {

    return (
        <header>
            <div className="container">
                <div className="header__items row">
                    <div className="header-logo">
                        <Link href="/" className="header-logo__wrapper row">
                            <Image
                                alt="Logo spoločnosti"
                                src="/icons/logo.svg"
                                width={36}
                                height={36}
                                priority
                            />

                            <p>Fini</p>

                        </Link>
                    </div>
                    <div className="header-item">
                        <nav className="header-nav">
                            <Link href="/spravy">Všetky správy</Link>
                            <Link href="/autori">Autori</Link>
                            <Link href="/o-nas">O nás</Link>
                            <Link href="/kontakt">Kontakt</Link>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    )

}


export default Header