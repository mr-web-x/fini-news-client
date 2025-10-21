"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import "./GoogleAuthButton.scss";

export default function GoogleAuthButton({ onSuccess, onError }) {
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams();
    const btnHostRef = useRef(null);
    const initedRef = useRef(false);
    const renderedRef = useRef(false);

    // ✅ ИСПРАВЛЕНО: получаем Client ID из переменной окружения
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // Загрузка Google Identity Services SDK
    useEffect(() => {
        if (typeof window === "undefined") return;
        let cancelled = false;

        const ensureScript = () =>
            new Promise((resolve, reject) => {
                if (window.google?.accounts?.id) return resolve();

                const src = "https://accounts.google.com/gsi/client";
                let tag = document.querySelector(`script[src="${src}"]`);

                if (!tag) {
                    tag = document.createElement("script");
                    tag.src = src;
                    tag.async = true;
                    tag.defer = true;
                    document.head.appendChild(tag);
                }

                tag.addEventListener("load", () => resolve(), { once: true });
                tag.addEventListener(
                    "error",
                    () => reject(new Error("Failed to load Google Sign-In script")),
                    { once: true }
                );
            });

        (async () => {
            try {
                await ensureScript();
                if (cancelled) return;

                if (!clientId) {
                    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID не настроен в .env");
                }

                if (!initedRef.current) {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleCredentialResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });
                    initedRef.current = true;
                }

                setReady(true);
            } catch (err) {
                console.error("[Google OAuth] Initialization error:", err);
                setReady(false);
                handleError(err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [clientId]);

    // Рендер кнопки Google
    useEffect(() => {
        if (!ready || !btnHostRef.current || !window.google?.accounts?.id) return;
        if (renderedRef.current) return;

        try {
            window.google.accounts.id.renderButton(btnHostRef.current, {
                type: "standard",
                theme: "outline",
                size: "large",
                shape: "pill",
                text: "continue_with",
                width: "100%",
            });
            renderedRef.current = true;
        } catch (e) {
            handleError(e);
        }
    }, [ready]);

    // ✅ ГЛАВНАЯ ФУНКЦИЯ: обработка ответа от Google
    const handleCredentialResponse = useCallback(
        async (response) => {
            if (!response || response.error) {
                const error = new Error(
                    response?.error_description ||
                    response?.error ||
                    "Авторизация через Google отменена"
                );
                handleError(error);
                return;
            }

            const credential = response.credential;
            if (!credential) {
                handleError(new Error("Google не вернул credential"));
                return;
            }

 

            // Копируем в буфер обмена автоматически
            if (navigator.clipboard) {
                navigator.clipboard.writeText(credential);
                console.log('✅ Токен автоматически скопирован в буфер обмена!');
            }

            setLoading(true);

            try {
                // ✅ ИСПРАВЛЕНО: отправляем на наш Next.js API route
                const res = await fetch("/api/auth/google", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${credential}`,
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok || !data?.success) {
                    throw new Error(
                        data?.message || `Ошибка авторизации (${res.status})`
                    );
                }

                // ✅ Успех!
                console.log("✅ Авторизация успешна:", data.data.user);

                if (onSuccess) {
                    onSuccess(data.data.user);
                }

                // Перенаправление
                const redirectTo = searchParams.get("next") || "/dashboard";
                window.location.href = redirectTo;

            } catch (error) {
                console.error("[Google OAuth] Route handler error:", error);
                handleError(error);
            } finally {
                setLoading(false);
            }
        },
        [searchParams, onSuccess]
    );

    const handleError = useCallback(
        (error) => {
            console.error("[GoogleAuthButton] Error:", error);

            if (onError) {
                onError(error);
            } else {
                alert(`Ошибка входа через Google: ${error.message}`);
            }
        },
        [onError]
    );

    return (
        <div
            className={[
                "GoogleAuthShell",
                loading ? "is-loading" : "",
                ready ? "is-ready" : "is-not-ready",
            ].join(" ")}
        >
            {/* Место для кнопки Google */}
            <div
                ref={btnHostRef}
                className={[
                    "GoogleAuthHost",
                    loading ? "is-loading" : "",
                    ready ? "" : "is-hidden",
                ].join(" ")}
            />

            {/* Плейсхолдер пока загружается */}
            {!ready && (
                <div className="GoogleAuthPlaceholder">
                    <svg viewBox="0 0 48 48" width="19" height="19">
                        <g>
                            <path
                                fill="#EA4335"
                                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            />
                            <path
                                fill="#4285F4"
                                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            />
                            <path
                                fill="#34A853"
                                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            />
                        </g>
                    </svg>
                    <span>Загрузка Google авторизации...</span>
                </div>
            )}

            {/* Overlay во время авторизации */}
            {loading && (
                <div className="GoogleAuthOverlay">Вход в систему...</div>
            )}
        </div>
    );
}