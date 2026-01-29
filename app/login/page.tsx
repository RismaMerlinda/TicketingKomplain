"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SuperadminLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulation of login process
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-neutral-light">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-glow/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Main Card */}
            <div className="w-full max-w-md bg-neutral-white rounded-2xl shadow-xl border border-neutral-border p-8 relative z-10 transition-all duration-300 hover:shadow-2xl">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <div className="relative w-48 h-16">
                            <Image
                                src="/diraya-logo.png"
                                alt="Diraya Tech Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-text-heading mb-2">Login</h1>
                    <p className="text-text-body text-sm">
                        Welcome back! Please enter your credentials to access the dashboard.
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-text-main">
                            Email Address
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                id="email"
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-2.5 bg-neutral-light/50 border border-neutral-border rounded-lg text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                placeholder="admin@diraya.tech"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-text-main">
                            Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="block w-full pl-10 pr-10 py-2.5 bg-neutral-light/50 border border-neutral-border rounded-lg text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-main transition-colors focus:outline-none"
                            >
                                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center py-3 px-4 bg-primary hover:bg-primary-hover active:bg-primary-active text-white rounded-lg font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-text-muted">
                        &copy; {new Date().getFullYear()} Diraya Tech. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
