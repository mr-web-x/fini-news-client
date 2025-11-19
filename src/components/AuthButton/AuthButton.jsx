import "./AuthButton.scss";
import Link from "next/link";
import { User, UserCircle } from "lucide-react";

/**
 * AuthButton - кнопка авторизации или ссылка на профиль (только иконки)
 * @param {Object} user - данные пользователя (если авторизован)
 */
const AuthButton = ({ user = null }) => {

    // Если пользователь авторизован - показываем иконку профиля
    if (user) {
        return (
            <Link href="/profil" className="auth-button auth-button--profile">
                <UserCircle size={20} />
            </Link>
        );
    }

    // Если не авторизован - показываем иконку входа
    return (
        <Link href="/prihlasenie" className="auth-button auth-button--login">
            <User size={20} />
        </Link>
    );
};

export default AuthButton;