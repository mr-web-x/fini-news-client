"use client";
import "./LoginPage.scss"

import GoogleAuthButton from "@/components/GoogleAuthButton/GoogleAuthButton";


export default function LoginPage() {
    const handleSuccess = (user) => {
        console.log("✅ Пользователь авторизован:", user);
    };

    const handleError = (error) => {
        console.error("❌ Ошибка авторизации:", error);
    };

    return (
        <div className="login-form__wrapper">
            <div class="login-form">
                <div class="login-form-title">
                    <h2>Autorizovať sa</h2>
                    <p>
                        Na prihlásenie do profilu použite svoj účet Google.
                    </p>
                </div>

                <GoogleAuthButton
                    onSuccess={handleSuccess}
                    onError={handleError}
                />


            </div>

        </div>
    );
}


