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
        router.push("/machine-dashboard");
    }
        return (
        <form onSubmit={onSubmit} className="space-y-2">

            <div className="grid w-fullmax-w-sm items-center gap-1.5">
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">Email:</label>
                <input id="email" name="email" type="email" className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#00A527] sm:text-sm/6" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            
            <div className="grid w-fullmax-w-sm items-center gap-1.5" >
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">Password:</label>
                <input id="password" name="password" type="password" className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#00A527] sm:text-sm/6" value={password} onChange={e => setPassword(e.target.value)}/>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <div className="w-full">
                <button type="submit" className="mt-8 w-full bg-[#00A527] font-semibold text-white rounded-lg px-4 py-2 hover:bg-[#00A527]/80">{loading ? "Signing in..." : "Login"}</button>
            </div>
        </form>
    )

}