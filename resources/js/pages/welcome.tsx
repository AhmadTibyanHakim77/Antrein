import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    CalendarDays,
    Check,
    Clock3,
    QrCode,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';

type SharedProps = {
    auth: { user: { name: string } | null };
};

const benefits = [
    {
        icon: CalendarDays,
        title: 'Reservasi lebih teratur',
        text: 'Tampilkan slot yang benar-benar tersedia sesuai jadwal dan kapasitas cabang.',
        tone: 'bg-teal-50 text-teal-800',
    },
    {
        icon: Clock3,
        title: 'Antrean lebih transparan',
        text: 'Pelanggan memantau nomor dan estimasi waktu melalui tautan status pribadi.',
        tone: 'bg-sky-50 text-sky-800',
    },
    {
        icon: Users,
        title: 'Tim lebih terkoordinasi',
        text: 'Atur peran, layanan, dan cabang agar setiap petugas melihat antrean yang menjadi tugasnya.',
        tone: 'bg-amber-50 text-amber-800',
    },
    {
        icon: BarChart3,
        title: 'Operasional mudah ditinjau',
        text: 'Pantau kunjungan, waktu tunggu, layanan selesai, dan unduh laporan CSV.',
        tone: 'bg-violet-50 text-violet-800',
    },
];

export default function Welcome() {
    const { auth } = usePage<SharedProps>().props;
    const primaryHref = auth.user ? '/dashboard' : '/register';

    return (
        <>
            <Head title="Antrein — antrean tertata, layanan lebih berkelas" />
            <div className="antrein-ambient min-h-screen overflow-hidden text-slate-900">
                <header className="sticky top-0 z-40 border-b border-white/70 bg-white/75 shadow-[0_8px_24px_-24px_rgba(15,23,42,.35)] backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
                        <Link
                            href="/"
                            className="flex items-center gap-3"
                            aria-label="Antrein beranda"
                        >
                            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-800 text-white shadow-[0_12px_24px_-12px_rgba(15,118,110,.8),inset_0_1px_0_rgba(255,255,255,.28)]">
                                <AppLogoIcon className="size-7" />
                            </span>
                            <span>
                                <span className="block text-lg font-black tracking-tight">
                                    antrein
                                    <span className="text-teal-600">.</span>
                                </span>
                                <span className="block text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                                    Ruang layanan yang tertata
                                </span>
                            </span>
                        </Link>
                        <nav
                            className="flex items-center gap-1 sm:gap-3"
                            aria-label="Navigasi utama"
                        >
                            <a
                                href="#fitur"
                                className="hidden rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-800 sm:inline-flex"
                            >
                                Fitur
                            </a>
                            <a
                                href="#cara-kerja"
                                className="hidden rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-800 md:inline-flex"
                            >
                                Cara kerja
                            </a>
                            <Link
                                href="/login"
                                className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-slate-950"
                            >
                                Masuk
                            </Link>
                            <Link
                                href={primaryHref}
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-teal-800"
                            >
                                Mulai gratis <ArrowRight size={16} />
                            </Link>
                        </nav>
                    </div>
                </header>

                <main>
                    <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pt-12 pb-20 sm:px-8 sm:pt-16 lg:grid-cols-[.94fr_1.06fr] lg:gap-16 lg:pt-20 lg:pb-28">
                        <div className="relative z-10">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-3.5 py-2 text-xs font-extrabold text-teal-800 shadow-[0_8px_22px_-18px_rgba(15,118,110,.55)]">
                                <Sparkles size={14} /> Operasional lebih rapi,
                                pelanggan lebih tenang
                            </div>
                            <h1 className="max-w-2xl text-[2.7rem] leading-[1.04] font-black tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.35rem]">
                                Antrean tertata.
                                <br />
                                <span className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-500 bg-clip-text text-transparent">
                                    Layanan terasa berkelas.
                                </span>
                            </h1>
                            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                                Antrein menyatukan reservasi, antrean langsung,
                                dan ruang kerja tim. Pelanggan tahu langkah
                                berikutnya; Anda fokus memberi layanan terbaik.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href={primaryHref}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-700 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-teal-800"
                                >
                                    {auth.user
                                        ? 'Buka ruang kerja'
                                        : 'Buat ruang usaha'}{' '}
                                    <ArrowRight size={17} />
                                </Link>
                                <a
                                    href="#fitur"
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:border-teal-200 hover:text-teal-800"
                                >
                                    Jelajahi fitur <ArrowUpRight size={16} />
                                </a>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-500">
                                <span className="inline-flex items-center gap-2">
                                    <Check
                                        size={16}
                                        className="text-teal-700"
                                    />{' '}
                                    Reservasi dan walk-in
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Check
                                        size={16}
                                        className="text-teal-700"
                                    />{' '}
                                    Bisa untuk banyak cabang
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Check
                                        size={16}
                                        className="text-teal-700"
                                    />{' '}
                                    Status pelanggan real-time
                                </span>
                            </div>
                            <div className="mt-9 flex items-center gap-3 border-t border-slate-200/80 pt-5">
                                <div
                                    className="flex -space-x-2"
                                    aria-hidden="true"
                                >
                                    <span className="grid size-8 place-items-center rounded-full border-2 border-[#f6f9f8] bg-teal-700 text-[10px] font-black text-white">
                                        A
                                    </span>
                                    <span className="grid size-8 place-items-center rounded-full border-2 border-[#f6f9f8] bg-sky-700 text-[10px] font-black text-white">
                                        B
                                    </span>
                                    <span className="grid size-8 place-items-center rounded-full border-2 border-[#f6f9f8] bg-amber-600 text-[10px] font-black text-white">
                                        C
                                    </span>
                                </div>
                                <p className="text-xs leading-5 text-slate-500">
                                    <span className="font-extrabold text-slate-700">
                                        Satu ruang kerja terpadu
                                    </span>
                                    <br />
                                    untuk pemilik, petugas, dan pelanggan.
                                </p>
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-[620px] [perspective:1500px]">
                            <div
                                aria-hidden="true"
                                className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-teal-200/65 via-emerald-100/40 to-amber-100/70 blur-3xl"
                            />
                            <div
                                aria-hidden="true"
                                className="absolute top-10 -right-6 size-40 rounded-full border border-white/80 bg-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,.9)] backdrop-blur-xl sm:-right-10 sm:size-52"
                            />
                            <div className="antrein-surface antrein-hero-card relative z-10 rounded-[2rem] p-4 sm:rounded-[2.25rem] sm:p-6">
                                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="grid size-10 place-items-center rounded-xl bg-teal-700 text-white shadow-[0_10px_20px_-12px_rgba(15,118,110,.8)]">
                                            <Activity size={19} />
                                        </span>
                                        <div>
                                            <p className="text-[10px] font-black tracking-[.18em] text-teal-800 uppercase">
                                                Pratinjau ruang kerja
                                            </p>
                                            <p className="mt-0.5 text-sm font-extrabold text-slate-900">
                                                Operasional cabang
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-extrabold text-emerald-800">
                                        <span className="size-1.5 rounded-full bg-emerald-500" />{' '}
                                        Contoh tampilan
                                    </span>
                                </div>

                                <div className="mt-5 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400">
                                            Kamis, 08 Oktober
                                        </p>
                                        <h2 className="mt-1 text-lg font-black tracking-tight sm:text-xl">
                                            Ringkasan hari ini
                                        </h2>
                                    </div>
                                    <span className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-[10px] font-bold text-slate-500">
                                        Cabang utama{' '}
                                        <span className="ml-1 text-teal-700">
                                            ⌄
                                        </span>
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
                                    {[
                                        {
                                            label: 'Menunggu',
                                            value: '08',
                                            tone: 'border-amber-100 bg-gradient-to-br from-amber-50 to-white text-amber-800',
                                        },
                                        {
                                            label: 'Dilayani',
                                            value: '02',
                                            tone: 'border-teal-100 bg-gradient-to-br from-teal-50 to-white text-teal-800',
                                        },
                                        {
                                            label: 'Selesai',
                                            value: '24',
                                            tone: 'border-sky-100 bg-gradient-to-br from-sky-50 to-white text-sky-800',
                                        },
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            className={
                                                'rounded-2xl border p-3 shadow-[0_12px_25px_-22px_rgba(15,23,42,.42),inset_0_1px_0_white] sm:p-4 ' +
                                                item.tone
                                            }
                                        >
                                            <p className="text-[9px] font-black tracking-[.13em] uppercase opacity-70 sm:text-[10px]">
                                                {item.label}
                                            </p>
                                            <p className="mt-1.5 text-2xl font-black tracking-tight sm:mt-2 sm:text-3xl">
                                                {item.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 rounded-[1.5rem] bg-gradient-to-br from-[#0f4c45] via-teal-800 to-emerald-700 p-4 text-white shadow-[0_24px_45px_-26px_rgba(15,118,110,.72),inset_0_1px_0_rgba(255,255,255,.2)] sm:p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[9px] font-black tracking-[.18em] text-teal-100/75 uppercase">
                                                Sedang dilayani · contoh
                                            </p>
                                            <p className="mt-2 text-2xl font-black tracking-tight">
                                                A-012{' '}
                                                <span className="text-sm font-semibold text-teal-100">
                                                    Layanan umum
                                                </span>
                                            </p>
                                        </div>
                                        <span className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-teal-100 shadow-inner">
                                            <Clock3 size={18} />
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                                            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-teal-200 to-white shadow-[0_0_12px_rgba(255,255,255,.6)]" />
                                        </div>
                                        <span className="text-[10px] font-bold text-teal-50">
                                            Sedang berjalan
                                        </span>
                                    </div>
                                    <p className="mt-3 flex items-center gap-2 text-[11px] text-teal-50/85">
                                        <Clock3 size={13} /> Perkiraan giliran
                                        berikutnya 15–25 menit
                                    </p>
                                </div>

                                <div className="mt-4 space-y-2.5">
                                    {[
                                        {
                                            number: 'A-013',
                                            service: 'Layanan umum',
                                            wait: 'Menunggu',
                                        },
                                        {
                                            number: 'A-014',
                                            service: 'Konsultasi',
                                            wait: 'Menunggu',
                                        },
                                    ].map((ticket) => (
                                        <div
                                            key={ticket.number}
                                            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-3.5 py-3 shadow-[0_8px_20px_-18px_rgba(15,23,42,.32),inset_0_1px_0_white] sm:px-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-[10px] font-black text-slate-700 shadow-[inset_0_1px_0_white]">
                                                    {ticket.number}
                                                </span>
                                                <div>
                                                    <p className="text-xs font-extrabold text-slate-800">
                                                        Pelanggan contoh
                                                    </p>
                                                    <p className="mt-0.5 text-[10px] text-slate-500">
                                                        {ticket.service}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-extrabold text-amber-800">
                                                {ticket.wait}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400">
                                    <span className="inline-flex items-center gap-1.5">
                                        <ShieldCheck
                                            size={13}
                                            className="text-teal-700"
                                        />{' '}
                                        Data hanya ilustrasi
                                    </span>
                                    <span>Antrein · Ruang kerja</span>
                                </div>
                            </div>

                            <div className="antrein-float absolute top-20 -left-5 z-20 hidden items-center gap-3 rounded-2xl border border-white/90 bg-white/95 px-4 py-3 shadow-[0_20px_45px_-25px_rgba(15,118,110,.38),inset_0_1px_0_white] sm:flex">
                                <span className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-800">
                                    <QrCode size={18} />
                                </span>
                                <span>
                                    <span className="block text-[9px] font-black tracking-[.14em] text-slate-400 uppercase">
                                        Pelanggan
                                    </span>
                                    <span className="mt-0.5 block text-xs font-extrabold text-slate-800">
                                        Cek status lewat tautan
                                    </span>
                                </span>
                            </div>
                            <div
                                className="antrein-float absolute -right-3 bottom-12 z-20 hidden items-center gap-3 rounded-2xl border border-white/90 bg-white/95 px-4 py-3 shadow-[0_20px_45px_-25px_rgba(15,118,110,.38),inset_0_1px_0_white] sm:flex"
                                style={{ animationDelay: '1.4s' }}
                            >
                                <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                                    <Check size={18} />
                                </span>
                                <span>
                                    <span className="block text-[9px] font-black tracking-[.14em] text-slate-400 uppercase">
                                        Tim usaha
                                    </span>
                                    <span className="mt-0.5 block text-xs font-extrabold text-slate-800">
                                        Alur layanan tercatat
                                    </span>
                                </span>
                            </div>
                        </div>
                    </section>

                    <section
                        id="fitur"
                        className="relative border-y border-white/70 bg-white/60 py-16 backdrop-blur-xl sm:py-20"
                    >
                        <div className="mx-auto max-w-7xl px-5 sm:px-8">
                            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                                <div className="max-w-2xl">
                                    <p className="text-xs font-black tracking-[.2em] text-teal-700 uppercase">
                                        Dibuat untuk operasional nyata
                                    </p>
                                    <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                                        Satu platform. Lebih sedikit hal yang
                                        tercecer.
                                    </h2>
                                </div>
                                <p className="max-w-md text-sm leading-6 text-slate-600">
                                    Dari pelanggan membuat janji sampai pemilik
                                    meninjau performa, setiap langkah tersambung
                                    dalam satu alur.
                                </p>
                            </div>
                            <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {benefits.map(
                                    (
                                        { icon: Icon, title, text, tone },
                                        index,
                                    ) => (
                                        <article
                                            key={title}
                                            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={
                                                        'grid size-12 place-items-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.9)] ' +
                                                        tone
                                                    }
                                                >
                                                    <Icon size={21} />
                                                </span>
                                                <span className="text-xs font-black tracking-[.16em] text-slate-300">
                                                    0{index + 1}
                                                </span>
                                            </div>
                                            <h3 className="mt-5 text-base font-extrabold text-slate-900">
                                                {title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                                {text}
                                            </p>
                                        </article>
                                    ),
                                )}
                            </div>
                        </div>
                    </section>

                    <section
                        id="cara-kerja"
                        className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:items-center"
                    >
                        <div>
                            <p className="text-xs font-black tracking-[.2em] text-teal-700 uppercase">
                                Lebih tertata setiap hari
                            </p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                                Mudah dimulai. Jelas dijalankan.
                            </h2>
                            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
                                Mulai dari satu cabang, atur layanan dan jadwal,
                                lalu bagikan halaman pemesanan. Tim dapat
                                langsung mengelola antrean dari dashboard.
                            </p>
                            <Link
                                href={primaryHref}
                                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-teal-800"
                            >
                                {auth.user
                                    ? 'Kembali ke ruang kerja'
                                    : 'Mulai dengan Antrein'}{' '}
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {[
                                {
                                    n: '01',
                                    icon: CalendarDays,
                                    title: 'Atur',
                                    text: 'Cabang, jam operasional, layanan, dan kapasitas.',
                                },
                                {
                                    n: '02',
                                    icon: QrCode,
                                    title: 'Bagikan',
                                    text: 'Tautan dan QR membawa pelanggan ke halaman cabang.',
                                },
                                {
                                    n: '03',
                                    icon: Activity,
                                    title: 'Layani',
                                    text: 'Petugas memperbarui antrean; pelanggan mengikuti status.',
                                },
                            ].map(({ n, icon: Icon, title, text }) => (
                                <article
                                    key={n}
                                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-800">
                                            <Icon size={18} />
                                        </span>
                                        <span className="text-xs font-black tracking-[.16em] text-slate-300">
                                            {n}
                                        </span>
                                    </div>
                                    <h3 className="mt-5 text-sm font-extrabold">
                                        {title}
                                    </h3>
                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                        {text}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20">
                        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f4c45] via-teal-800 to-emerald-700 px-6 py-9 text-white shadow-[0_34px_70px_-38px_rgba(15,118,110,.72),inset_0_1px_0_rgba(255,255,255,.2)] sm:px-10 sm:py-12">
                            <div
                                aria-hidden="true"
                                className="absolute -top-28 -right-12 size-72 rounded-full border border-white/10 bg-white/[.04] shadow-[inset_0_1px_0_rgba(255,255,255,.18)]"
                            />
                            <div
                                aria-hidden="true"
                                className="absolute -right-2 -bottom-40 size-80 rounded-full bg-emerald-300/10 blur-2xl"
                            />
                            <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                                <div className="max-w-2xl">
                                    <p className="text-xs font-black tracking-[.2em] text-teal-100/75 uppercase">
                                        Mulai dari kebutuhan usaha Anda
                                    </p>
                                    <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                                        Buat pelanggan merasa lebih pasti sejak
                                        awal.
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-teal-50/80">
                                        Siapkan ruang usaha, atur cabang, dan
                                        bagikan halaman reservasi dengan mudah.
                                    </p>
                                </div>
                                <Link
                                    href={primaryHref}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-teal-900 shadow-[0_12px_28px_-16px_rgba(0,0,0,.45),inset_0_1px_0_white] transition hover:-translate-y-0.5 hover:bg-teal-50"
                                >
                                    Mulai gratis <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-slate-200/80 bg-white/70 px-5 py-6 backdrop-blur-xl sm:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
                        <div>
                            <p className="text-sm font-black tracking-tight text-slate-700">
                                antrein<span className="text-teal-700">.</span>
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                © {new Date().getFullYear()} Antrein · Atur
                                antrean, tenangkan pelanggan.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                            <Link
                                href="/privasi"
                                className="transition hover:text-teal-800"
                            >
                                Privasi
                            </Link>
                            <Link
                                href="/ketentuan"
                                className="transition hover:text-teal-800"
                            >
                                Ketentuan
                            </Link>
                            <a
                                href="#fitur"
                                className="transition hover:text-teal-800"
                            >
                                Fitur
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
