import  LoginForm  from "./form";


export default function RegisterPage() {
    return (
        <div className="h-screen w-screen flex justify-center items-center bg-slate-100">
            <div className="shadow-xl px-8 pb-8 pt-12 bg-white rounded-xl space-y-12"> 
                <h1 className="font-semibold text-2xl py-8">Sign in to your account</h1>
                <LoginForm />
                <p className="text-center">Don't have an account?  <a href="/register" className="text-indigo-500 hover:underline">Sign up</a></p>
            </div>
        </div>
    )
}