import React from "react";

interface MonopolyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "success";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
}

export function MonopolyButton({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    disabled,
    ...props
}: MonopolyButtonProps) {
    const borderColor =
        variant === "danger"
            ? "border-red-500"
            : variant === "success"
            ? "border-emerald-600"
            : variant === "secondary"
            ? "border-zinc-500"
            : "border-blue-500";

    const bgAndHover =
        variant === "danger"
            ? "bg-red-500 hover:bg-red-600 active:bg-red-700"
            : variant === "success"
            ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
            : variant === "secondary"
            ? "bg-zinc-700 hover:bg-zinc-800 active:bg-zinc-900"
            : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700";

    const sizeClass =
        size === "sm"
            ? "text-[10px] p-1.5 px-2"
            : size === "lg"
            ? "text-sm p-3 px-4"
            : "text-xs p-2 px-3";

    return (
        <div className={`border-2 ${borderColor} ${fullWidth ? "w-full" : "inline-block"}`}>
            <button
                disabled={disabled}
                className={`inline-block border-2 border-white font-bold text-white transition-all select-none ${
                    disabled
                        ? "bg-zinc-400 border-zinc-200 cursor-not-allowed text-zinc-200 opacity-60"
                        : `${bgAndHover} cursor-pointer active:scale-98 shadow-sm`
                } ${sizeClass} ${fullWidth ? "w-full" : ""} ${className}`}
                {...props}
            >
                {children}
            </button>
        </div>
    );
}

export default MonopolyButton;
