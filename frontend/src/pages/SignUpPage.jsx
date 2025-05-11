import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    const { signup, isSigningUp } = useAuthStore();

    const validateForm = () => {
        if(!formData.fullName.trim()) return toast.error("Full name is required");
        if(!formData.email.trim()) return toast.error("Email is required");
        if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
        if (!formData.password) return toast.error("Password is required");
        if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const success = validateForm()
        if(success === true) signup(formData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-3xl font-bold">Join us today</h1>
                        <p className="text-sm text-base-content/60">Start your journey with a new account</p>
                    </div>


                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Full Name</span>
                        </label>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="size-5" />
                            </div>

                            <input
                                type="text"
                                className={`input input-bordered w-full pl-10`}
                                placeholder="Mykola Rud"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Email</span>
                        </label>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="size-5" />
                            </div>

                            <input
                                type="email"
                                className={`input input-bordered w-full pl-10`}
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Password</span>
                        </label>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="size-5" />
                            </div>

                            <input
                                type={showPassword ? "text" : "password"}
                                className={`input input-bordered w-full pl-10`}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />

                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >

                            {showPassword ? (
                                <EyeOff className="size-5" />
                            ) : (
                                <Eye className="size-5" />
                            )}

                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
                        {isSigningUp ? (
                        <>
                            <Loader2 className="size-5 animate-spin" />
                                Loading...
                        </>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-base-content/60">
                        Already have an account?{" "}
                            <Link to="/login" className="link link-primary">
                                Sign in
                            </Link>
                    </p>
                </div>
            </div>
        </div>
  );
};

export default SignUpPage;
