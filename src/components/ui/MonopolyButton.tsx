import React from "react";

export type ButtonVariant = "red" | "green" | "neutral" | "ghost" | "danger" | "primary" | "secondary" | "success";

interface MonopolyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    children: React.ReactNode;
}

export function MonopolyButton({ variant = "red", size = "md", fullWidth = false, className = "", children, disabled, ...props }: MonopolyButtonProps) {
    const baseStyle = "font-bold transition-all duration-150 uppercase tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none text-center";

    const sizeStyles = {
        sm: "px-3 py-1 text-xs border-2",
        md: "px-5 py-2 text-sm border-2",
        lg: "px-7 py-3 text-base border-3",
    };

    const variantStyles: Record<ButtonVariant, string> = {
        red: "bg-red-500 text-white border-white hover:bg-red-600 active:scale-98 shadow-md",
        primary: "bg-red-500 text-white border-white hover:bg-red-600 active:scale-98 shadow-md",
        green: "bg-green-600 text-white border-white hover:bg-green-700 active:scale-98 shadow-md",
        success: "bg-green-600 text-white border-white hover:bg-green-700 active:scale-98 shadow-md",
        neutral: "bg-blue-900 text-white border-white hover:bg-blue-950 active:scale-98 shadow-md",
        secondary: "bg-blue-900 text-white border-white hover:bg-blue-950 active:scale-98 shadow-md",
        danger: "bg-red-700 text-white border-white hover:bg-red-800 active:scale-98 shadow-md",
        ghost: "bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100 active:scale-98 shadow-sm",
    };

    return (
        <button className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? "w-full" : ""} ${className}`} disabled={disabled} {...props}>{children}</button>
    );
}
