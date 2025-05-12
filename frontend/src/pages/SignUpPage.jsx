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

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(email)) return false;
        
        if (/[^\w.%+-@]/.test(email)) return false;
        
        if (email.startsWith('.') || email.endsWith('.') || email.includes('..')) {
            return false;
        }
        
        const atCount = (email.match(/@/g) || []).length;
        if (atCount !== 1) return false;
        
        const parts = email.split('@');
        if (parts.length !== 2) return false;
        
        const [localPart, domain] = parts;
        
        if (localPart.length > 64) return false;
        
        if (domain.length > 253) return false;
        
        const domainParts = domain.split('.');
        if (domainParts.some(part => part.length > 63)) return false;
        
        return true;
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            toast.error("Full name is required");
            return false;
        }

        if (!formData.email.trim()) {
            toast.error("Email is required");
            return false;
        }

        if (!validateEmail(formData.email)) {
            toast.error("Please enter a valid email address (e.g., example@domain.com)");
            return false;
        }

        if (!formData.password) {
            toast.error("Password is required");
            return false;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const success = validateForm();
        if (success) signup(formData);
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
                                className="input input-bordered w-full pl-10"
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
                                className="input input-bordered w-full pl-10"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        {!validateEmail(formData.email) && formData.email.length > 0 && (
                            <p className="mt-1 text-xs text-red-500">
                                Please enter a valid email address (e.g., example@domain.com)
                            </p>
                        )}
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
                                className="input input-bordered w-full pl-10"
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
                        {formData.password.length > 0 && formData.password.length < 6 && (
                            <p className="mt-1 text-xs text-red-500">
                                Password must be at least 6 characters
                            </p>
                        )}
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