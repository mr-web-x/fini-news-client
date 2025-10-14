"use client";

import GoogleAuthButton from "@/components/GoogleAuthButton/GoogleAuthButton";

export default function LoginPage() {
    const handleSuccess = (user) => {
        console.log("✅ Пользователь авторизован:", user);
    };

    const handleError = (error) => {
        console.error("❌ Ошибка авторизации:", error);
    };

    return (
        <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px" }}>
            <h1>Вход в систему</h1>
            <p>Войдите через Google для продолжения</p>

            <GoogleAuthButton
                onSuccess={handleSuccess}
                onError={handleError}
            />
        </div>
    );
}