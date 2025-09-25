'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";


export const RegisterForm = () => {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();


    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const supabase = createClient();

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        });

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        router.push('/check-email' );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-12 w-200">
            <div className="grid w-fullmax-w-sm items-center gap-1.5">
                <label htmlFor="username">Username:</label>
                <input id="username" name="username" type="text" className="border border-gray-500 rounded px-2 py-1" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            
            <div className="grid w-fullmax-w-sm items-center gap-1.5">
                <label htmlFor="email">Email:</label>
                <input id="email" name="email" type="email" className="border border-gray-500 rounded px-2 py-1" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            
            <div className="grid w-fullmax-w-sm items-center gap-1.5" >
                <label htmlFor="password">Password:</label>
                <input id="password" name="password" type="password" className="border border-gray-500 rounded px-2 py-1" value={password} onChange={e => setPassword(e.target.value)}/>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <div className="w-full">
                <button type="submit" className="w-full bg-indigo-500 text-white rounded px-4 py-2 hover:bg-indigo-950">{loading? "Creating..." : "Register"}</button>
            </div>
        </form>
    );

}