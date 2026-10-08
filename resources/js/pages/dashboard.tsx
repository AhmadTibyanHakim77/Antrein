import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Bell,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Copy,
    ExternalLink,
    MapPin,
    Pause,
    Play,
    Plus,
    QrCode,
    Scissors,
    Settings2,
    Users,
    Wrench,
    X,
    LogOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type Branch = { id: number; name: string };
type Service = {
    id: number;
    name: string;
    duration_minutes: number;
    allow_walk_ins: boolean;
    walk_in_unavailable_reason: string | null;
};
type Ticket = {
    id: number;
    code: string;
    queue_number: number | null;
    customer_name: string;
    customer_phone: string;
    service: string;
    status: string;
    type: string;
    scheduled_for: string;
    created_at: string;
    call_count: number;
    can_recall: boolean;
    no_show_wait_minutes: number;
    can_mark_no_show: boolean;
};
type Props = {
    business: { id: number; name: string; slug: string; category: string };
    branches: Branch[];
    branch: {
        id: number;
        name: string;
        address: string;
        queue_enabled: boolean;
        timezone: string;
        call_grace_minutes: number;
        max_call_attempts: number;
        public_url: string;
        qr_url: string;
    };
    services: Service[];
    tickets: Ticket[];
    appointments: Ticket[];
    stats: {
        waiting: number;
        in_service: number;
        completed: number;
        no_show: number;
        cancelled: number;
        average_service_minutes: number | null;
        average_wait_minutes: number | null;
    };
    today: string;
    flash?: string | null;
    flash_error?: string | null;
    user_name?: string;
    permissions: { manage_business: boolean; manage_services: boolean };
};

type WalkInForm = {
    service_id: number | string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
};

export default function Dashboard({
    business,
    branches,
    branch,
    services,
    tickets,
    appointments,
    stats,
    today,
    flash,
    flash_error,
    user_name,
    permissions,
}: Props) {
    const [showWalkIn, setShowWalkIn] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const walkInServices = services.filter((service) => service.allow_walk_ins);
    const walkIn = useForm<WalkInForm>({
        service_id: walkInServices[0]?.id ?? '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
    });
    const selectedWalkInService = walkInServices.find(
        (service) => service.id === Number(walkIn.data.service_id),
    );
    const current =
        tickets.find((ticket) => ticket.status === 'in_service') ??
        tickets.find((ticket) => ticket.status === 'called');

    useEffect(() => {
        const markOnline = () => setIsOnline(true);
        const markOffline = () => setIsOnline(false);
        setIsOnline(navigator.onLine);
        window.addEventListener('online', markOnline);
        window.addEventListener('offline', markOffline);
        const timer = window.setInterval(
            () =>
                router.reload({
                    only: [
                        'branch',
                        'services',
                        'tickets',
                        'appointments',
                        'stats',
                        'flash',
                        'flash_error',
                    ],
                }),
            12000,
        );
        return () => {
            window.clearInterval(timer);
            window.removeEventListener('online', markOnline);
            window.removeEventListener('offline', markOffline);
        };
    }, []);

    const selectBranch = (id: number) =>
        router.get('/dashboard', { branch_id: id }, { preserveState: false });
    const runQueueAction = (bookingId: number, action: string) =>
        router.post(
            '/bookings/' + bookingId + '/actions/' + action,
            {},
            { preserveScroll: true },
        );
    const callNext = () =>
        router.post(
            '/branches/' + branch.id + '/queue/next',
            {},
            { preserveScroll: true },
        );
    const toggleQueue = () =>
        router.post(
            '/branches/' + branch.id + '/queue/toggle',
            {},
            { preserveScroll: true },
        );
    const copyPublicLink = async () => {
        await navigator.clipboard.writeText(
            window.location.origin + branch.public_url,
        );
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    return (
        <>
            <Head title="Ruang kerja — Antrein" />
            <div className="antrein-ambient min-h-screen bg-[#f6f8f8] text-slate-900">
                <div className="min-w-0">
                    <header className="flex min-h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-7 lg:px-10">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-xs font-semibold text-slate-600">
                                    {today}
                                </p>
                                <div className="mt-0.5 flex items-center gap-2">
                                    <h1 className="text-base font-extrabold sm:text-lg">
                                        Ruang kerja {business.name}
                                    </h1>
                                    <span
                                        className={
                                            'hidden rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide uppercase sm:inline-flex ' +
                                            (isOnline
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-amber-50 text-amber-800')
                                        }
                                    >
                                        {isOnline
                                            ? 'Sinkron aktif'
                                            : 'Offline · data tertunda'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            {branches.length > 1 && (
                                <label className="relative hidden sm:block">
                                    <span className="sr-only">
                                        Pilih cabang
                                    </span>
                                    <select
                                        value={branch.id}
                                        onChange={(e) =>
                                            selectBranch(Number(e.target.value))
                                        }
                                        className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-sm font-semibold"
                                    >
                                        <option value={branch.id}>
                                            {branch.name}
                                        </option>
                                        {branches
                                            .filter(
                                                (item) => item.id !== branch.id,
                                            )
                                            .map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.name}
                                                </option>
                                            ))}
                                    </select>
                                    <ChevronDown
                                        size={15}
                                        className="pointer-events-none absolute top-3 right-3 text-slate-400"
                                    />
                                </label>
                            )}
                            <button
                                onClick={() => setShowWalkIn(true)}
                                disabled={
                                    !branch.queue_enabled ||
                                    walkInServices.length === 0
                                }
                                title={
                                    !branch.queue_enabled
                                        ? 'Antrean sedang dijeda'
                                        : walkInServices.length === 0
                                          ? 'Belum ada layanan yang menerima walk-in'
                                          : undefined
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-3.5 py-2.5 text-xs font-extrabold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-45 sm:px-4 sm:text-sm"
                            >
                                <Plus size={16} />{' '}
                                <span className="hidden sm:inline">
                                    Tambah walk-in
                                </span>
                                <span className="sm:hidden">Walk-in</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => router.post('/logout')}
                                className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                aria-label="Keluar dari akun"
                                title="Keluar"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </header>

                    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
                        {(flash || flash_error) && (
                            <div
                                role="status"
                                className={
                                    'mb-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ' +
                                    (flash_error
                                        ? 'bg-rose-50 text-rose-700'
                                        : 'bg-emerald-50 text-emerald-800')
                                }
                            >
                                {flash_error ? (
                                    <X size={16} />
                                ) : (
                                    <CheckCircle2 size={16} />
                                )}
                                {flash_error || flash}
                            </div>
                        )}

                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-xs font-black tracking-[.18em] text-teal-700 uppercase">
                                    Operasional cabang
                                </p>
                                <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                                    Halo
                                    {user_name
                                        ? ', ' + user_name.split(' ')[0]
                                        : ''}{' '}
                                    👋
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    Pantau antrean dan reservasi yang perlu
                                    ditangani hari ini.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href={branch.public_url}
                                    target="_blank"
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:border-teal-300 hover:text-teal-800"
                                >
                                    <ExternalLink size={15} /> Lihat halaman
                                    publik
                                </a>
                                <button
                                    onClick={copyPublicLink}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:border-teal-300 hover:text-teal-800"
                                >
                                    <Copy size={15} />{' '}
                                    {copied ? 'Tersalin' : 'Salin tautan'}
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            <StatCard
                                label="Menunggu"
                                value={stats.waiting}
                                icon={Users}
                                tone="amber"
                                foot="Pelanggan di antrean"
                            />
                            <StatCard
                                label="Sedang dilayani"
                                value={stats.in_service}
                                icon={Activity}
                                tone="teal"
                                foot="Layanan berjalan"
                            />
                            <StatCard
                                label="Selesai hari ini"
                                value={stats.completed}
                                icon={CheckCircle2}
                                tone="blue"
                                foot="Antrean terselesaikan"
                            />
                            <StatCard
                                label="Rata-rata tunggu"
                                value={
                                    stats.average_wait_minutes === null
                                        ? '—'
                                        : stats.average_wait_minutes + ' mnt'
                                }
                                icon={Clock3}
                                tone="violet"
                                foot="Check-in hingga mulai dilayani"
                            />
                            <StatCard
                                label="Durasi layanan"
                                value={
                                    stats.average_service_minutes === null
                                        ? '—'
                                        : stats.average_service_minutes + ' mnt'
                                }
                                icon={Clock3}
                                tone="violet"
                                foot={
                                    stats.no_show +
                                    ' tidak hadir · ' +
                                    stats.cancelled +
                                    ' batal'
                                }
                            />
                        </div>

                        <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,.75fr)]">
                            <section
                                id="antrean"
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-extrabold">
                                                Antrean berjalan
                                            </h3>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                                                {tickets.length}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Urutan mengikuti nomor antrean pada
                                            layanan.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={
                                                'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ' +
                                                (branch.queue_enabled
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-amber-50 text-amber-700')
                                            }
                                        >
                                            <span
                                                className={
                                                    'size-1.5 rounded-full ' +
                                                    (branch.queue_enabled
                                                        ? 'bg-emerald-500'
                                                        : 'bg-amber-500')
                                                }
                                            />
                                            {branch.queue_enabled
                                                ? 'Antrean dibuka'
                                                : 'Antrean dijeda'}
                                        </span>
                                        <button
                                            onClick={toggleQueue}
                                            className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            title={
                                                branch.queue_enabled
                                                    ? 'Jeda antrean'
                                                    : 'Buka antrean'
                                            }
                                        >
                                            {branch.queue_enabled ? (
                                                <Pause size={15} />
                                            ) : (
                                                <Play size={15} />
                                            )}
                                        </button>
                                        <button
                                            disabled={
                                                !branch.queue_enabled ||
                                                stats.waiting === 0
                                            }
                                            onClick={callNext}
                                            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-3.5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Bell size={15} /> Panggil
                                            berikutnya
                                        </button>
                                    </div>
                                </div>

                                {current && (
                                    <div className="mx-5 mt-5 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-white p-4 sm:mx-6 sm:p-5">
                                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                            <div className="flex items-center gap-4">
                                                <span className="grid size-14 place-items-center rounded-2xl bg-teal-700 text-sm font-black text-white shadow-md shadow-teal-900/10">
                                                    {current.queue_number
                                                        ? 'A-' +
                                                          String(
                                                              current.queue_number,
                                                          ).padStart(3, '0')
                                                        : '—'}
                                                </span>
                                                <div>
                                                    <p className="text-[10px] font-black tracking-[.17em] text-teal-700 uppercase">
                                                        {current.status ===
                                                        'in_service'
                                                            ? 'Sedang dilayani'
                                                            : 'Sedang dipanggil'}
                                                    </p>
                                                    <h4 className="mt-1 text-lg font-extrabold">
                                                        {current.customer_name}
                                                    </h4>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {current.service} ·{' '}
                                                        {current.code}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {current.status ===
                                                    'called' && (
                                                    <>
                                                        <button
                                                            disabled={
                                                                !current.can_recall
                                                            }
                                                            title={
                                                                !current.can_recall
                                                                    ? 'Batas panggilan telah tercapai'
                                                                    : 'Panggil pelanggan sekali lagi'
                                                            }
                                                            onClick={() =>
                                                                runQueueAction(
                                                                    current.id,
                                                                    'recall',
                                                                )
                                                            }
                                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            {current.can_recall
                                                                ? 'Panggil ulang · ' +
                                                                  current.call_count
                                                                : 'Batas panggilan'}
                                                        </button>
                                                        <button
                                                            disabled={
                                                                !current.can_mark_no_show
                                                            }
                                                            title={
                                                                !current.can_mark_no_show
                                                                    ? 'Tunggu masa toleransi ' +
                                                                      current.no_show_wait_minutes +
                                                                      ' menit'
                                                                    : 'Tandai pelanggan tidak hadir'
                                                            }
                                                            onClick={() =>
                                                                runQueueAction(
                                                                    current.id,
                                                                    'no-show',
                                                                )
                                                            }
                                                            className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            {current.can_mark_no_show
                                                                ? 'Tidak hadir'
                                                                : 'Tidak hadir · ' +
                                                                  current.no_show_wait_minutes +
                                                                  ' mnt'}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                runQueueAction(
                                                                    current.id,
                                                                    'start',
                                                                )
                                                            }
                                                            className="rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-800"
                                                        >
                                                            Mulai layanan
                                                        </button>
                                                    </>
                                                )}
                                                {current.status ===
                                                    'in_service' && (
                                                    <button
                                                        onClick={() =>
                                                            runQueueAction(
                                                                current.id,
                                                                'complete',
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-800"
                                                    >
                                                        <Check size={14} />{' '}
                                                        Selesaikan layanan
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="px-5 py-4 sm:px-6">
                                    {tickets.length === 0 ? (
                                        <EmptyState
                                            icon={Users}
                                            title="Belum ada antrean aktif"
                                            text="Pelanggan walk-in akan muncul di sini. Anda juga dapat mendaftarkan pelanggan dari tombol Tambah walk-in."
                                        />
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {tickets
                                                .filter(
                                                    (ticket) =>
                                                        ticket.id !==
                                                        current?.id,
                                                )
                                                .map((ticket) => (
                                                    <div
                                                        key={ticket.id}
                                                        className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-black text-slate-700">
                                                                {ticket.queue_number
                                                                    ? 'A-' +
                                                                      String(
                                                                          ticket.queue_number,
                                                                      ).padStart(
                                                                          3,
                                                                          '0',
                                                                      )
                                                                    : '—'}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <p className="truncate text-sm font-extrabold">
                                                                        {
                                                                            ticket.customer_name
                                                                        }
                                                                    </p>
                                                                    <StatusPill
                                                                        status={
                                                                            ticket.status
                                                                        }
                                                                    />
                                                                </div>
                                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                                    {
                                                                        ticket.service
                                                                    }{' '}
                                                                    ·{' '}
                                                                    {
                                                                        ticket.code
                                                                    }{' '}
                                                                    ·{' '}
                                                                    {
                                                                        ticket.created_at
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 sm:pl-4">
                                                            {ticket.status ===
                                                                'waiting' && (
                                                                <button
                                                                    onClick={() =>
                                                                        runQueueAction(
                                                                            ticket.id,
                                                                            'cancel',
                                                                        )
                                                                    }
                                                                    className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                                                                >
                                                                    Batalkan
                                                                </button>
                                                            )}
                                                            {ticket.status ===
                                                                'waiting' && (
                                                                <button
                                                                    onClick={
                                                                        callNext
                                                                    }
                                                                    disabled={
                                                                        !branch.queue_enabled
                                                                    }
                                                                    className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-teal-50 hover:text-teal-800 disabled:opacity-50"
                                                                >
                                                                    Panggil
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                                {appointments.length > 0 && (
                                    <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
                                        <div className="mb-3 flex items-center gap-2">
                                            <CalendarDays
                                                size={17}
                                                className="text-violet-600"
                                            />
                                            <h4 className="text-sm font-extrabold">
                                                Reservasi hari ini
                                            </h4>
                                            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-700">
                                                {appointments.length}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {appointments.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 px-3.5 py-3 sm:flex-row sm:items-center"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="grid size-9 place-items-center rounded-lg bg-violet-50 text-xs font-black text-violet-700">
                                                            {item.scheduled_for}
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-bold">
                                                                {
                                                                    item.customer_name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {item.service} ·{' '}
                                                                {item.code}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            runQueueAction(
                                                                item.id,
                                                                'check-in',
                                                            )
                                                        }
                                                        className="rounded-lg border border-violet-200 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-50"
                                                    >
                                                        Check-in
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>

                            <aside className="space-y-5">
                                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs font-black tracking-[.16em] text-slate-400 uppercase">
                                                Halaman pelanggan
                                            </p>
                                            <h3 className="mt-1 text-lg font-extrabold">
                                                Bagikan tautan antrean
                                            </h3>
                                        </div>
                                        <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-700">
                                            <QrCode size={19} />
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Pelanggan dapat memilih layanan, membuat
                                        reservasi, atau mengambil antrean
                                        langsung.
                                    </p>
                                    <div className="mt-4 flex items-center gap-4 rounded-xl bg-slate-50 p-3">
                                        <img
                                            src={branch.qr_url}
                                            alt={'QR pemesanan ' + branch.name}
                                            className="size-24 rounded-lg border border-slate-200 bg-white p-1"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs font-extrabold text-slate-700">
                                                Pindai untuk membuka halaman
                                                cabang
                                            </p>
                                            <span className="mt-1 block truncate text-[11px] font-semibold text-slate-500">
                                                {branch.public_url}
                                            </span>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <button
                                                    onClick={copyPublicLink}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-2 text-[11px] font-bold text-slate-600 shadow-sm hover:text-teal-700"
                                                >
                                                    <Copy size={13} />
                                                    {copied
                                                        ? 'Tersalin'
                                                        : 'Salin tautan'}
                                                </button>
                                                <a
                                                    href={
                                                        branch.qr_url +
                                                        '?download=1'
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-2.5 py-2 text-[11px] font-bold text-white hover:bg-teal-800"
                                                >
                                                    <QrCode size={13} />
                                                    Unduh QR
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    {permissions.manage_services && (
                                        <Link
                                            href="/services"
                                            className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-teal-800 hover:text-teal-950"
                                        >
                                            Atur layanan{' '}
                                            <ArrowRight size={15} />
                                        </Link>
                                    )}
                                </section>

                                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-black tracking-[.16em] text-slate-400 uppercase">
                                                Layanan cabang
                                            </p>
                                            <h3 className="mt-1 text-lg font-extrabold">
                                                Layanan aktif
                                            </h3>
                                        </div>
                                        {permissions.manage_services && (
                                            <Link
                                                href="/services"
                                                className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:text-teal-700"
                                                aria-label="Kelola layanan"
                                            >
                                                <Settings2 size={16} />
                                            </Link>
                                        )}
                                    </div>
                                    {services.length === 0 ? (
                                        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                                            Tambahkan layanan agar pelanggan
                                            dapat membuat reservasi.
                                        </p>
                                    ) : (
                                        <div className="mt-4 space-y-3">
                                            {services
                                                .slice(0, 4)
                                                .map((service, index) => (
                                                    <div
                                                        key={service.id}
                                                        className="flex items-center justify-between gap-3"
                                                    >
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <span
                                                                className={
                                                                    'grid size-9 shrink-0 place-items-center rounded-xl ' +
                                                                    [
                                                                        'bg-teal-50 text-teal-700',
                                                                        'bg-sky-50 text-sky-700',
                                                                        'bg-amber-50 text-amber-700',
                                                                        'bg-violet-50 text-violet-700',
                                                                    ][index % 4]
                                                                }
                                                            >
                                                                {index % 2 ===
                                                                0 ? (
                                                                    <Scissors
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <Wrench
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                )}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-bold">
                                                                    {
                                                                        service.name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {
                                                                        service.duration_minutes
                                                                    }{' '}
                                                                    menit
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="size-2 rounded-full bg-emerald-500" />{' '}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </section>

                                <section className="antrein-highlight-panel p-5 sm:p-6">
                                    <div className="flex items-center gap-3">
                                        <span className="grid size-10 place-items-center rounded-xl bg-teal-100 text-teal-800">
                                            <MapPin size={18} />
                                        </span>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-600">
                                                Lokasi saat ini
                                            </p>
                                            <h3 className="text-sm font-extrabold">
                                                {branch.name}
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs leading-5 text-slate-600">
                                        {branch.address}
                                    </p>
                                    <div className="mt-4 border-t border-teal-100 pt-4">
                                        <p className="text-xs font-semibold text-slate-600">
                                            Rata-rata layanan selesai
                                        </p>
                                        <p className="mt-1 text-2xl font-black">
                                            {stats.average_service_minutes ===
                                            null
                                                ? 'Belum ada data'
                                                : stats.average_service_minutes +
                                                  ' menit'}
                                        </p>
                                    </div>
                                </section>
                            </aside>
                        </div>
                    </div>
                </div>
            </div>

            {showWalkIn && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget)
                            setShowWalkIn(false);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="walkin-title"
                        className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-black tracking-[.16em] text-teal-700 uppercase">
                                    Pendaftaran langsung
                                </p>
                                <h2
                                    id="walkin-title"
                                    className="mt-1 text-xl font-black"
                                >
                                    Tambah pelanggan walk-in
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Pelanggan langsung mendapat nomor antrean
                                    berikutnya.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowWalkIn(false)}
                                className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
                                aria-label="Tutup"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                walkIn.transform((data) => ({
                                    ...data,
                                    service_id: Number(data.service_id),
                                }));
                                walkIn.post(
                                    '/branches/' + branch.id + '/walk-ins',
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            walkIn.reset();
                                            setShowWalkIn(false);
                                        },
                                    },
                                );
                            }}
                            className="mt-6 space-y-4"
                        >
                            <label className="block text-sm font-bold text-slate-700">
                                Layanan
                                <select
                                    value={walkIn.data.service_id}
                                    onChange={(e) =>
                                        walkIn.setData(
                                            'service_id',
                                            Number(e.target.value),
                                        )
                                    }
                                    className={inputClass}
                                    required
                                >
                                    {walkInServices.map((service) => (
                                        <option
                                            key={service.id}
                                            value={service.id}
                                        >
                                            {service.name} ·{' '}
                                            {service.duration_minutes} menit
                                        </option>
                                    ))}
                                </select>
                                {walkIn.errors.service_id && (
                                    <span className="mt-1 block text-xs text-rose-600">
                                        {walkIn.errors.service_id}
                                    </span>
                                )}
                            </label>
                            {selectedWalkInService?.walk_in_unavailable_reason && (
                                <p
                                    role="status"
                                    className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800"
                                >
                                    {
                                        selectedWalkInService.walk_in_unavailable_reason
                                    }
                                </p>
                            )}
                            <Field
                                label="Nama pelanggan"
                                error={walkIn.errors.customer_name}
                            >
                                <input
                                    value={walkIn.data.customer_name}
                                    onChange={(e) =>
                                        walkIn.setData(
                                            'customer_name',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                    required
                                />
                            </Field>
                            <Field
                                label="Nomor telepon"
                                error={walkIn.errors.customer_phone}
                            >
                                <input
                                    value={walkIn.data.customer_phone}
                                    onChange={(e) =>
                                        walkIn.setData(
                                            'customer_phone',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                    placeholder="08xxxxxxxxxx"
                                    required
                                />
                            </Field>
                            <Field
                                label="Email (opsional)"
                                error={walkIn.errors.customer_email}
                            >
                                <input
                                    type="email"
                                    value={walkIn.data.customer_email}
                                    onChange={(e) =>
                                        walkIn.setData(
                                            'customer_email',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <button
                                disabled={
                                    walkIn.processing ||
                                    walkInServices.length === 0 ||
                                    !branch.queue_enabled ||
                                    Boolean(
                                        selectedWalkInService?.walk_in_unavailable_reason,
                                    )
                                }
                                className="w-full rounded-xl bg-teal-700 px-4 py-3.5 text-sm font-extrabold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {walkIn.processing
                                    ? 'Mendaftarkan…'
                                    : 'Masukkan ke antrean'}
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    tone,
    foot,
}: {
    label: string;
    value: string | number;
    icon: typeof Users;
    tone: string;
    foot: string;
}) {
    const tones: Record<string, string> = {
        amber: 'bg-amber-50 text-amber-700',
        teal: 'bg-teal-50 text-teal-700',
        blue: 'bg-sky-50 text-sky-700',
        violet: 'bg-violet-50 text-violet-700',
    };
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-500">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-black tracking-tight">
                        {value}
                    </p>
                </div>
                <span
                    className={
                        'grid size-10 place-items-center rounded-xl ' +
                        tones[tone]
                    }
                >
                    <Icon size={18} />
                </span>
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-400">
                {foot}
            </p>
        </article>
    );
}

function StatusPill({ status }: { status: string }) {
    const labels: Record<string, string> = {
        waiting: 'Menunggu',
        called: 'Dipanggil',
        in_service: 'Dilayani',
        scheduled: 'Terjadwal',
        completed: 'Selesai',
        cancelled: 'Dibatalkan',
        no_show: 'Tidak hadir',
    };
    const tones: Record<string, string> = {
        waiting: 'bg-amber-50 text-amber-700',
        called: 'bg-sky-50 text-sky-700',
        in_service: 'bg-teal-50 text-teal-700',
        scheduled: 'bg-violet-50 text-violet-700',
        completed: 'bg-emerald-50 text-emerald-700',
        cancelled: 'bg-slate-100 text-slate-600',
        no_show: 'bg-rose-50 text-rose-700',
    };
    return (
        <span
            className={
                'rounded-full px-2.5 py-1 text-[10px] font-extrabold ' +
                (tones[status] ?? 'bg-slate-100 text-slate-600')
            }
        >
            {labels[status] ?? status}
        </span>
    );
}

function EmptyState({
    icon: Icon,
    title,
    text,
}: {
    icon: typeof Users;
    title: string;
    text: string;
}) {
    return (
        <div className="flex flex-col items-center px-4 py-10 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                <Icon size={21} />
            </span>
            <h4 className="mt-4 text-sm font-extrabold">{title}</h4>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                {text}
            </p>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block text-sm font-bold text-slate-700">
            {label}
            {children}
            {error && (
                <span className="mt-1 block text-xs font-medium text-rose-600">
                    {error}
                </span>
            )}
        </label>
    );
}

const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';
