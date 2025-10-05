// lib/supabase/server-readonly.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createReadonlyClient() {
  const cookieStore = await cookies(); // ⟵ ASYNC!

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() { /* no-op RSC-ben */ },
        remove() { /* no-op RSC-ben */ },
      },
    }
  );

  return supabase;
}
