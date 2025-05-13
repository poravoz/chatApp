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
    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        password: ""
    });

    const { signup, isSigningUp } = useAuthStore();

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(email)) return false;
        if (/[^\w.%+-@]/.test(email)) return false;
        if (email.startsWith('.') || email.endsWith('.') || email.includes('..')) return false;
        
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

    const validateField = (name, value) => {
        switch (name) {
            case 'fullName':
                if (!value.trim()) return "Full name is required";
                if (value.trim().length < 3) return "Name must be at least 3 characters";
                return "";
            case 'email':
                if (!value.trim()) return "Email is required";
                if (!validateEmail(value)) return "Please enter a valid email address";
                return "";
            case 'password':
                if (!value) return "Password is required";
                if (value.length < 6) return "Password must be at least 6 characters";
                return "";
            default:
                return "";
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name in errors) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            fullName: validateField('fullName', formData.fullName),
            email: validateField('email', formData.email),
            password: validateField('password', formData.password)
        };
        
        setErrors(newErrors);
        
        if (Object.values(newErrors).some(error => error)) {
            isValid = false;
            toast.error("Please fix the errors in the form");
        }
        
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            signup(formData).catch(error => {
                toast.error(error.message || "Registration failed");
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-base-100">
            <div className="w-full max-w-md space-y-8 bg-base-200 p-8 rounded-lg shadow-lg">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Join us today</h1>
                    <p className="text-sm text-base-content/60">Start your journey with a new account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name Field */}
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
                                name="fullName"
                                className={`input input-bordered w-full pl-10 ${errors.fullName ? 'input-error' : ''}`}
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.fullName && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.fullName}
                            </p>
                        )}
                    </div>

                    {/* Email Field */}
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
                                name="email"
                                className={`input input-bordered w-full pl-10 ${errors.email ? 'input-error' : ''}`}
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
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
                                name="password"
                                className={`input input-bordered w-full pl-10 ${errors.password ? 'input-error' : ''}`}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
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
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary w-full mt-6"
                        disabled={isSigningUp}
                    >
                        {isSigningUp ? (
                            <>
                                <Loader2 className="size-5 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <div className="text-center pt-4">
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