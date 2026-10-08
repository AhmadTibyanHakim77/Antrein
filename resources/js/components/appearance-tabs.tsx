import { Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'flex items-center gap-3 rounded-2xl border border-teal-100 bg-gradient-to-r from-white via-teal-50/70 to-cyan-50/60 p-4 shadow-sm',
                className,
            )}
            {...props}
        >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-800">
                <Sun className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">Tema terang</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-600">
                    Warna yang konsisten dan nyaman dibaca di seluruh Antrein.
                </p>
            </div>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">
                Aktif
            </span>
        </div>
    );
}
