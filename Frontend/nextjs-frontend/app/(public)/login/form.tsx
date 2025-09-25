'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() { 

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const router = useRouter();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const supabase = createClient();
        
        
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
        setLoading(false);
        
        
        if (error) {
            setError(error.message);
            return;
        }
        router.push("/dashboard");
    }
        return (
        <form onSubmit={onSubmit} className="space-y-12 w-200">

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
                <button type="submit" className="w-full bg-indigo-500 text-white rounded px-4 py-2 hover:bg-indigo-950">{loading ? "Signing in..." : "Login"}</button>
            </div>
        </form>
    )

}