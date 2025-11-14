import "./AuthButton.scss";
import Link from "next/link";
import { User } from "lucide-react";

/**
 * AuthButton - кнопка авторизации или ссылка на профиль
 * @param {Object} user - данные пользователя (если авторизован)
 */
const AuthButton = ({ user = null }) => {

    // Если пользователь авторизован - показываем кнопку профиля
    if (user) {
        return (
            <Link href="/profil" className="auth-button auth-button--profile">
                <img
                    src={user.avatar || "/icons/user-placeholder.svg"}
                    alt={user.displayName || "User"}
                    className="auth-button__avatar"
                />
                <span className="auth-button__name">{user.displayName}</span>
            </Link>
        );
    }

    // Если не авторизован - показываем кнопку входа
    return (
        <Link href="/prihlasenie" className="auth-button auth-button--login">
            <User size={16} />
            <span>Prihlásiť sa</span>
        </Link>
    );
};

export default AuthButton;