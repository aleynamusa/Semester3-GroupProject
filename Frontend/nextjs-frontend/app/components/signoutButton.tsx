'use client'

import {createClient} from "@/lib/supabase/client";

export function SignOutButton() {
    const onClick = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/login";
    }
    return (
        <button onClick={onClick} className="w-full bg-[#00A527] hover:bg-green-700 text-gray-200 hover:text-white
                                 font-medium rounded-lg text-[1rem] px-5 py-2.5 text-center">Sign Out</button>
    )
}