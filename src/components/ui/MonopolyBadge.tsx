import React from "react";

interface MonopolyBadgeProps {
    children: React.ReactNode;
    color?: string;
    variant?: "default" | "active" | "inactive" | "left";
    className?: string;
}

export function MonopolyBadge({ children, color, variant = "default", className = "" }: MonopolyBadgeProps) {
    const variantStyles = {
        default: "bg-white text-zinc-900 border-zinc-400",
        active: "bg-amber-100 text-amber-900 border-amber-500 shadow-md font-extrabold ring-2 ring-amber-400",
        inactive: "bg-zinc-100 text-zinc-600 border-zinc-300 opacity-75",
        left: "bg-zinc-200 text-zinc-400 border-zinc-300 opacity-50 line-through",
    };

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-none text-xs font-bold ${variantStyles[variant]} ${className}`} style={color ? { borderLeftColor: color, borderLeftWidth: "6px" } : undefined}>{children}</div>
    );
}
