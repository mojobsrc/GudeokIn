import React from "react";
import NavBarLayout from "../components/mobile/Header/NavBarLayout";
import InfoPage from "@/app/components/mobile/Account/InfoPage";
import { getUserSession } from "../lib/user";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "학생 정보",
};
export default async function Account() {
    const { isLoggedIn, user } = await getUserSession();

    if (!isLoggedIn) {
        redirect(encodeURI("/?alert=로그인 후 이용가능한 서비스 입니다"));
    }

    return (
        <NavBarLayout>
            <InfoPage user={user!} />
        </NavBarLayout>
    );
}
