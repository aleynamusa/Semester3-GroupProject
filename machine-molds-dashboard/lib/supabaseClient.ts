import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  console.warn("Supabase environment variables are not set: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(url ?? "", key ?? "");

export default supabase;
