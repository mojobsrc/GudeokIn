"use client";

import { useState, useEffect } from "react";
import { fetchToken } from "@/app/lib/firebase";

async function getNotificationPermissionAndToken() {
    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            return await fetchToken();
        }
    }

    console.log("Notification permission not granted.");
    return null;
}

const isIOSDevice = () => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

const IosNotifiDialog = () => {
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        if (!("Notification" in window)) {
            console.info("ios device에 pwa추가를 하지않아 지원안할 수 있음");
            return;
        }

        if (Notification.permission === "granted") {
            console.info("이미 허용되있는경우");
            return;
        }

        if (isIOSDevice()) {
            setShowDialog(true);
        }
    }, []);

    const handleAllowNotifications = async () => {
        await getNotificationPermissionAndToken();
        setShowDialog(false);
    };

    return (
        <>
            {showDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg mx-3 shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-4">알림 허용</h2>
                        <p className="mb-4">이 기기에서 알림을 허용해주세요.</p>
                        <button
                            onClick={handleAllowNotifications}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                        >
                            허용하기
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default IosNotifiDialog;
