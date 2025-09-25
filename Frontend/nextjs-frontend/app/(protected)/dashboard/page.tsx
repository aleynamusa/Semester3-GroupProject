import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/app/components/signoutButton';



export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login");
    }
    return (
      <div className="p-8">
      <h1 className="text-2xl font-semibold">Welcome, {user.user_metadata?.username ?? user.email}</h1>
      <p className="mt-2 text-gray-600">This page is protected.</p>
      <SignOutButton />
    </div>
  )
}