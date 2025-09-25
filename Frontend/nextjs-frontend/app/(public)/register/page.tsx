import { RegisterForm } from "./form";

export default function RegisterPage() {
    return (
        <div className="h-screen w-screen flex justify-center items-center bg-slate-100">
            <div className="shadow-xl px-8 pb-8 pt-12 bg-white rounded-xl space-y-12"> 
                <h1 className="font-semibold text-2xl py-8">Create your Account</h1>
                <RegisterForm />
                <p className="text-center">Have an account?  <a href="/login" className="text-indigo-500 hover:underline">Sign in</a></p>
            </div>
        </div>
    )
}