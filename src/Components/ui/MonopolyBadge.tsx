import React from "react";

interface MonopolyBadgeProps {
    children: React.ReactNode;
    variant?: "primary" | "danger" | "success" | "warning" | "neutral";
    className?: string;
}

export function MonopolyBadge({
    children,
    variant = "primary",
    className = "",
}: MonopolyBadgeProps) {
    const borderColor =
        variant === "danger"
            ? "border-red-500"
            : variant === "success"
            ? "border-emerald-600"
            : variant === "warning"
            ? "border-amber-500"
            : variant === "neutral"
            ? "border-zinc-500"
            : "border-blue-500";

    const bgColor =
        variant === "danger"
            ? "bg-red-500"
            : variant === "success"
            ? "bg-emerald-600"
            : variant === "warning"
            ? "bg-amber-500"
            : variant === "neutral"
            ? "bg-zinc-600"
            : "bg-blue-500";

    return (
        <span className={`inline-block border-2 ${borderColor} ${className}`}>
            <span className={`inline-block border-2 border-white text-[9px] font-bold p-0.5 px-1.5 ${bgColor} text-white`}>
                {children}
            </span>
        </span>
    );
}

export default MonopolyBadge;
