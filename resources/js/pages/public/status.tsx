import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock3,
    MapPin,
    RefreshCw,
    ShieldCheck,
    TicketCheck,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type Booking = {
    id: number;
    code: string;
    customer_name: string;
    customer_phone: string;
    type: string;
    status: string;
    queue_number: number | null;
    scheduled_for: string;
    scheduled_label: string;
    branch_name: string;
    address: string;
    business_name: string;
    service_name: string;
    can_cancel: boolean;
    can_reschedule: boolean;
    cancellation_cutoff_minutes: number;
    timezone: string;
    token: string;
};
type Props = {
    booking: Booking;
    queue_position: number | null;
    wait_min: number | null;
    wait_max: number | null;
    wait_note: string | null;
    refreshed_at: string;
    flash?: string | null;
};

export default function BookingStatus({
    booking,
    queue_position,
    wait_min,
    wait_max,
    wait_note,
    flash,
}: Props) {
    const [isOnline, setIsOnline] = useState(true);
    const reschedule = useForm({
        scheduled_for: booking.scheduled_for.replace(' ', 'T'),
    });

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
                        'booking',
                        'queue_position',
                        'wait_min',
                        'wait_max',
                        'wait_note',
                        'refreshed_at',
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

    const statusText: Record<string, string> = {
        scheduled: 'Reservasi terkonfirmasi',
        waiting: 'Anda sedang mengantre',
        called: 'Silakan menuju petugas',
        in_service: 'Layanan sedang berlangsung',
        completed: 'Layanan selesai',
        cancelled: 'Reservasi dibatalkan',
        no_show: 'Reservasi ditandai tidak hadir',
        paused: 'Antrean sedang dijeda',
    };
    const statusTone: Record<string, string> = {
        scheduled: 'bg-violet-50 text-violet-800',
        waiting: 'bg-amber-50 text-amber-800',
        called: 'bg-sky-50 text-sky-800',
        in_service: 'bg-teal-50 text-teal-800',
        completed: 'bg-emerald-50 text-emerald-800',
        cancelled: 'bg-rose-50 text-rose-700',
        no_show: 'bg-rose-50 text-rose-700',
        paused: 'bg-slate-100 text-slate-700',
    };
    const isDone = ['completed', 'cancelled', 'no_show'].includes(
        booking.status,
    );

    return (
        <>
            <Head title={'Status ' + booking.code + ' — Antrein'} />
            <main className="antrein-ambient min-h-screen bg-[#f6f8f8] px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
                <div className="mx-auto max-w-2xl">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-800"
                    >
                        <ArrowLeft size={16} /> Beranda Antrein
                    </Link>
                    <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
                        <div className="border-b border-teal-100 bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-6 py-7 text-slate-900 sm:px-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-black tracking-[.18em] text-teal-700 uppercase">
                                        Status pemesanan
                                    </p>
                                    <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                                        {booking.business_name}
                                    </h1>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {booking.branch_name} ·{' '}
                                        {booking.service_name}
                                    </p>
                                </div>
                                <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-teal-100 bg-white/80 text-teal-700 shadow-sm">
                                    <TicketCheck size={22} />
                                </span>
                            </div>
                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-white/75 p-4 shadow-sm">
                                <div>
                                    <p className="text-[10px] font-bold tracking-[.16em] text-slate-500 uppercase">
                                        Kode reservasi
                                    </p>
                                    <p className="mt-1 text-xl font-black tracking-[.08em]">
                                        {booking.code}
                                    </p>
                                </div>
                                <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                                    {booking.type === 'walk_in'
                                        ? 'Antrean hari ini'
                                        : 'Janji temu'}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 sm:p-8">
                            {!isOnline && (
                                <div
                                    role="alert"
                                    className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"
                                >
                                    Koneksi terputus. Status ini mungkin belum
                                    terbaru; halaman akan memperbarui lagi
                                    setelah internet tersambung.
                                </div>
                            )}
                            {flash && (
                                <div
                                    role="status"
                                    className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
                                >
                                    <Check size={16} />
                                    {flash}
                                </div>
                            )}
                            <div
                                className={
                                    'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-extrabold ' +
                                    (statusTone[booking.status] ??
                                        'bg-slate-100 text-slate-700')
                                }
                            >
                                {booking.status === 'completed' ? (
                                    <CheckCircle2 size={19} />
                                ) : isDone ? (
                                    <XCircle size={19} />
                                ) : (
                                    <span className="size-2.5 animate-pulse rounded-full bg-current" />
                                )}
                                {statusText[booking.status] ?? booking.status}
                            </div>
                            {booking.queue_number && (
                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 p-5">
                                        <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                                            Nomor antrean
                                        </p>
                                        <p className="mt-2 text-4xl font-black tracking-tight text-teal-800">
                                            A-
                                            {String(
                                                booking.queue_number,
                                            ).padStart(3, '0')}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 p-5">
                                        <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                                            Posisi saat ini
                                        </p>
                                        <p className="mt-2 text-3xl font-black tracking-tight">
                                            {queue_position === null
                                                ? '—'
                                                : queue_position === 0
                                                  ? booking.status ===
                                                    'in_service'
                                                      ? 'Sedang dilayani'
                                                      : 'Giliran Anda'
                                                  : queue_position + ' antrean'}
                                        </p>
                                        {wait_min !== null && (
                                            <>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Perkiraan {wait_min}–
                                                    {wait_max} menit
                                                </p>
                                                {wait_note && (
                                                    <p className="mt-2 text-[11px] leading-4 text-slate-500">
                                                        {wait_note}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4">
                                <div className="flex items-start gap-3 text-sm">
                                    <CalendarDays
                                        size={17}
                                        className="mt-0.5 text-teal-700"
                                    />
                                    <div>
                                        <p className="font-bold">
                                            {booking.scheduled_label}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Waktu mengikuti zona waktu cabang.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin
                                        size={17}
                                        className="mt-0.5 text-teal-700"
                                    />
                                    <div>
                                        <p className="font-bold">
                                            {booking.branch_name}
                                        </p>
                                        <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                            {booking.address}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {!isDone && (
                                <div className="mt-5 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 p-3.5 text-xs leading-5 text-sky-900">
                                    <ShieldCheck
                                        size={16}
                                        className="mt-0.5 shrink-0"
                                    />
                                    <p>
                                        Halaman ini bersifat pribadi. Simpan
                                        tautan ini untuk memeriksa status.
                                        Antrein memperbarui informasi antrean
                                        otomatis setiap 12 detik selama koneksi
                                        tersedia.
                                    </p>
                                </div>
                            )}
                            {booking.type === 'appointment' &&
                                booking.status === 'scheduled' &&
                                booking.cancellation_cutoff_minutes > 0 && (
                                    <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
                                        Perubahan atau pembatalan tersedia
                                        paling lambat{' '}
                                        {booking.cancellation_cutoff_minutes}{' '}
                                        menit sebelum jadwal.
                                    </p>
                                )}
                            {booking.can_reschedule && (
                                <details className="mt-5 rounded-2xl border border-slate-200 p-4">
                                    <summary className="cursor-pointer list-none text-sm font-extrabold text-slate-700">
                                        <span className="inline-flex items-center gap-2">
                                            <RefreshCw
                                                size={15}
                                                className="text-teal-700"
                                            />{' '}
                                            Ubah jadwal
                                        </span>
                                    </summary>
                                    <form
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            reschedule.post(
                                                '/status/' +
                                                    booking.token +
                                                    '/jadwal',
                                                { preserveScroll: true },
                                            );
                                        }}
                                        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
                                    >
                                        <label className="flex-1 text-xs font-bold text-slate-600">
                                            Pilih waktu baru · waktu cabang
                                            <input
                                                type="datetime-local"
                                                value={
                                                    reschedule.data
                                                        .scheduled_for
                                                }
                                                onChange={(e) =>
                                                    reschedule.setData(
                                                        'scheduled_for',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                                required
                                            />
                                            {reschedule.errors
                                                .scheduled_for && (
                                                <span className="mt-1 block text-rose-600">
                                                    {
                                                        reschedule.errors
                                                            .scheduled_for
                                                    }
                                                </span>
                                            )}
                                        </label>
                                        <button
                                            disabled={reschedule.processing}
                                            className="rounded-xl bg-teal-700 px-4 py-3 text-xs font-extrabold text-white hover:bg-teal-800"
                                        >
                                            Simpan jadwal
                                        </button>
                                    </form>
                                </details>
                            )}
                            {booking.can_cancel && (
                                <button
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                'Batalkan reservasi ini?',
                                            )
                                        )
                                            router.post(
                                                '/status/' +
                                                    booking.token +
                                                    '/batal',
                                                {},
                                                { preserveScroll: true },
                                            );
                                    }}
                                    className="mt-4 text-xs font-bold text-rose-600 hover:text-rose-800"
                                >
                                    Batalkan reservasi
                                </button>
                            )}
                            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                                <span className="inline-flex items-center gap-2 text-[11px] text-slate-400">
                                    <Clock3 size={14} /> Diperbarui otomatis
                                </span>
                                <Link
                                    href="/"
                                    className="text-xs font-bold text-teal-800 hover:underline"
                                >
                                    Tentang Antrein
                                </Link>
                            </div>
                        </div>
                    </section>
                    <p className="mt-4 text-center text-xs text-slate-400">
                        Jika informasi belum berubah, tunggu beberapa saat lalu
                        muat ulang halaman.
                    </p>
                </div>
            </main>
        </>
    );
}

const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';
