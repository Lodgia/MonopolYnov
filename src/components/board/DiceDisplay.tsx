interface SingleDieProps {
    value: number;
    isRolling: boolean;
}

function SingleDie({ value, isRolling }: SingleDieProps) {
    const dotPositions: Record<number, number[][]> = {
        1: [[1, 1]],
        2: [
            [0, 0],
            [2, 2],
        ],
        3: [
            [0, 0],
            [1, 1],
            [2, 2],
        ],
        4: [
            [0, 0],
            [0, 2],
            [2, 0],
            [2, 2],
        ],
        5: [
            [0, 0],
            [0, 2],
            [1, 1],
            [2, 0],
            [2, 2],
        ],
        6: [
            [0, 0],
            [0, 2],
            [1, 0],
            [1, 2],
            [2, 0],
            [2, 2],
        ],
    };

    const dots = dotPositions[value] || dotPositions[1];

    return (
        <div
            className={`w-12 h-12 bg-white border-3 border-black shadow-md rounded-md p-1.5 grid grid-cols-3 grid-rows-3 gap-0.5 transition-transform duration-200 ${
                isRolling ? "animate-spin" : "hover:scale-105"
            }`}
        >
            {Array.from({ length: 9 }).map((_, index) => {
                const row = Math.floor(index / 3);
                const col = index % 3;
                const hasDot = dots.some(([r, c]) => r === row && c === col);
                return (
                    <div key={index} className="flex items-center justify-center">
                        {hasDot && <div className="w-2 h-2 bg-black rounded-full shadow-inner" />}
                    </div>
                );
            })}
        </div>
    );
}

interface DiceDisplayProps {
    value?: number;
    dice1?: number | null;
    dice2?: number | null;
    total?: number | null;
    isRolling?: boolean;
}

export function DiceDisplay({
    value,
    dice1,
    dice2,
    total,
    isRolling = false,
}: DiceDisplayProps) {
    const d1 = dice1 ?? value ?? 1;
    const d2 = dice2 ?? (dice1 ? 1 : undefined);

    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center justify-center gap-3">
                <SingleDie value={d1} isRolling={isRolling} />
                {d2 !== undefined && <SingleDie value={d2} isRolling={isRolling} />}
            </div>
            {total !== undefined && total !== null && (
                <span className="text-xs font-black uppercase tracking-wider text-zinc-800 bg-zinc-100 px-2 py-0.5 border border-zinc-400">
                    Total : {total}
                </span>
            )}
        </div>
    );
}
