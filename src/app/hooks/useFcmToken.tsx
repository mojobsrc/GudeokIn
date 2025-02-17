"use client";

import { useEffect, useRef, useState } from "react";
import { getToken, onMessage, Unsubscribe } from "firebase/messaging";
import { fetchToken, messaging } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import axios from "@/app/lib/axios";

async function getNotificationPermissionAndToken() {
    if (!("Notification" in window)) {
        console.info("This browser does not support desktop notification");
        return null;
    }

    // Step 2: Check if permission is already granted.
    if (Notification.permission === "granted") {
        return await fetchToken();
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            return await fetchToken();
        }
    }

    console.log("Notification permission not granted.");
    return null;
}

const useFcmToken = () => {
    const router = useRouter(); // Initialize the router for navigation.
    const [notificationPermissionStatus, setNotificationPermissionStatus] =
        useState<NotificationPermission | null>(null); // State to store the notification permission status.
    const [token, setToken] = useState<string | null>(null); // State to store the FCM token.
    const retryLoadToken = useRef(0); // Ref to keep track of retry attempts.
    const isLoading = useRef(false); // Ref to keep track if a token fetch is currently in progress.

    const loadToken = async () => {
        // Step 4: Prevent multiple fetches if already fetched or in progress.
        if (isLoading.current) return;

        isLoading.current = true; // Mark loading as in progress.
        const token = await getNotificationPermissionAndToken(); // Fetch the token.

        // Step 5: Handle the case where permission is denied.
        if (Notification.permission === "denied") {
            setNotificationPermissionStatus("denied");
            console.info(
                "%cPush Notifications issue - permission denied",
                "color: green; background: #c7c7c7; padding: 8px; font-size: 20px"
            );
            isLoading.current = false;
            return;
        }

        // Step 6: Retry fetching the token if necessary. (up to 3 times)
        // This step is typical initially as the service worker may not be ready/installed yet.
        if (!token) {
            if (retryLoadToken.current >= 3) {
                console.info(
                    "%cPush Notifications issue - unable to load token after 3 retries",
                    "color: green; background: #c7c7c7; padding: 8px; font-size: 20px"
                );
                isLoading.current = false;
                return;
            }

            retryLoadToken.current += 1;
            console.error(
                "An error occurred while retrieving token. Retrying..."
            );
            isLoading.current = false;
            await loadToken();
            return;
        }

        // Step 7: Set the fetched token and mark as fetched.
        setNotificationPermissionStatus(Notification.permission);

        try {
            await axios.post(`/api/auth/me`, {
                fcm: token,
            });
        } catch (error) {
            console.log(`Token Saved Error: ${error}`);
        }
        setToken(token);
        isLoading.current = false;
    };

    useEffect(() => {
        // Step 8: Initialize token loading when the component mounts.
        if ("Notification" in window) {
            loadToken();
        }
    }, []);

    useEffect(() => {
        const setupListener = async () => {
            if (!token) return; // Exit if no token is available.

            console.log(`등록된 token: ${token}`);
            const m = await messaging();
            if (!m) return;

            // Step 9: Register a listener for incoming FCM messages.
            const unsubscribe = onMessage(m, (payload) => {
                if (Notification.permission !== "granted") return;

                console.log("Foreground push notification received:", payload);
                const link = payload.fcmOptions?.link || payload.data?.link;

                // --------------------------------------------
                // Disable this if you only want toast notifications.
                const n = new Notification(
                    payload.data?.title || "New message",
                    {
                        body: payload.data?.body || "This is a new message",
                        data: link ? { url: link } : undefined,
                    }
                );

                // Step 10: Handle notification click event to navigate to a link if present.
                n.onclick = (event) => {
                    event.preventDefault();
                    const link = (event.target as any)?.data?.url;
                    if (link) {
                        router.push(link);
                    } else {
                        console.log(
                            "No link found in the notification payload"
                        );
                    }
                };
                // --------------------------------------------
            });

            return unsubscribe;
        };

        let unsubscribe: Unsubscribe | null = null;

        setupListener().then((unsub) => {
            if (unsub) {
                unsubscribe = unsub;
            }
        });

        // Step 11: Cleanup the listener when the component unmounts.
        return () => unsubscribe?.();
    }, [token, router]);

    return { token, notificationPermissionStatus, setToken }; // Return the token and permission status.
};

export default useFcmToken;
