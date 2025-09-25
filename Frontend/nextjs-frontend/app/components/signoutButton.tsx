'use client'

import {createClient} from "@/lib/supabase/client";

export function SignOutButton() {
    const onClick = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/login";
    }
    return (
        <button onClick={onClick} className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-950">Sign Out</button>
    )
}