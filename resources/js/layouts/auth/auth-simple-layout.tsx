import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <main className="auth-light antrein-ambient relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-[#f4f8f7] px-4 py-10 text-slate-900 sm:px-6">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-36 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-200/45 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -bottom-40 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl"
            />

            <div className="relative z-10 w-full max-w-lg">
                <Link
                    href={home()}
                    className="mx-auto flex w-fit items-center gap-3 rounded-2xl px-3 py-1.5"
                >
                    <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-800 text-white shadow-lg shadow-teal-900/15">
                        <AppLogoIcon className="size-7" />
                    </span>
                    <span className="text-left">
                        <span className="block text-lg font-bold tracking-tight text-slate-900">
                            Antrein
                        </span>
                        <span className="block text-xs font-medium text-slate-500">
                            Antrean lebih tertata
                        </span>
                    </span>
                </Link>

                <section className="antrein-surface mt-7 rounded-[28px] border border-white/90 bg-white/95 p-6 shadow-[0_24px_80px_-32px_rgba(15,118,110,0.25)] ring-1 ring-slate-900/[0.04] backdrop-blur sm:p-9">
                    <header className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {description}
                        </p>
                    </header>

                    <div className="mt-7">{children}</div>
                </section>

                <p className="mt-6 text-center text-xs font-medium tracking-wide text-slate-400">
                    Layanan antrean dan janji temu yang lebih nyaman.
                </p>
            </div>
        </main>
    );
}
