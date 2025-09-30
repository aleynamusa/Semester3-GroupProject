import  LoginForm  from "./form";


export default function RegisterPage() {
    return (
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-[#222523]">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-[2rem] font-bold tracking-tight text-white leading-9">
                  Sign in to your account
                    </h2>
                    </div>
                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <LoginForm />
                    <p className="mt-5 text-center text-sm/6 text-gray-400">
                        <span>Don&apos;t have an account? </span>
                    <a href="/register" className="font-semibold text-[#00A527] hover:text-green-300">Sign up</a>
                    </p>
                    </div>
                </div>
    )
}