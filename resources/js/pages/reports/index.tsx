import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Download,
    Filter,
    PauseCircle,
    Users,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Branch = { id: number; name: string };
type Service = { id: number; branch_id: number; name: string };
type Staff = {
    id: number;
    name: string;
    role: string;
    branch_id: number | null;
};
type Filters = {
    from: string;
    to: string;
    branch_id: number | null;
    service_id: number | null;
    staff_id: number | null;
};
type Stats = {
    total: number;
    scheduled: number;
    waiting: number;
    paused: number;
    completed: number;
    cancelled: number;
    no_show: number;
    average_wait_minutes: number | null;
    average_service_minutes: number | null;
};
type BookingRow = {
    id: number;
    code: string;
    date: string;
    time: string;
    customer_name: string;
    customer_phone: string;
    service: string;
    branch: string;
    type: string;
    queue_number: number | null;
    status: string;
};
type BookingPage = {
    data: BookingRow[];
    links: { url: string | null; label: string; active: boolean }[];
    from: number | null;
    to: number | null;
    total: number;
};
type Props = {
    business: { name: string };
    branches: Branch[];
    services: Service[];
    staff: Staff[];
    filters: Filters;
    stats: Stats;
    has_bookings: boolean;
    bookings: BookingPage;
};
type FilterForm = {
    from: string;
    to: string;
    branch_id: string;
    service_id: string;
    staff_id: string;
};

const statusLabels: Record<string, string> = {
    scheduled: 'Terjadwal',
    waiting: 'Menunggu',
    called: 'Dipanggil',
    in_service: 'Dilayani',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    no_show: 'Tidak hadir',
    paused: 'Ditunda',
};

export default function Reports({
    business,
    branches,
    services,
    staff,
    filters,
    stats,
    has_bookings,
    bookings,
}: Props) {
    const [form, setForm] = useState<FilterForm>({
        from: filters.from,
        to: filters.to,
        branch_id: filters.branch_id?.toString() ?? '',
        service_id: filters.service_id?.toString() ?? '',
        staff_id: filters.staff_id?.toString() ?? '',
    });
    const visibleServices = useMemo(
        () =>
            services.filter(
                (service) =>
                    !form.branch_id ||
                    service.branch_id === Number(form.branch_id),
            ),
        [services, form.branch_id],
    );
    const visibleStaff = useMemo(
        () =>
            staff.filter(
                (person) =>
                    !form.branch_id ||
                    person.branch_id === null ||
                    person.branch_id === Number(form.branch_id),
            ),
        [staff, form.branch_id],
    );

    const exportParams = new URLSearchParams(
        Object.entries({
            from: filters.from,
            to: filters.to,
            branch_id: filters.branch_id?.toString() ?? '',
            service_id: filters.service_id?.toString() ?? '',
            staff_id: filters.staff_id?.toString() ?? '',
        }).filter(([, value]) => value !== ''),
    ).toString();

    return (
        <>
            <Head title="Laporan operasional — Antrein" />
            <div className="antrein-ambient min-h-screen bg-[#f6f8f8] px-4 py-6 text-slate-900 sm:px-7 sm:py-8 lg:px-10">
                <div className="mx-auto max-w-[1500px]">
                    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="inline-flex items-center gap-2 text-xs font-black tracking-[.18em] text-teal-700 uppercase">
                                <BarChart3 size={15} /> Ringkasan operasional
                            </p>
                            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                                Laporan operasional
                            </h1>
                            <p className="mt-1 text-sm font-semibold text-slate-500">
                                {business.name}
                            </p>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Pantau reservasi, antrean, pembatalan, dan
                                durasi layanan berdasarkan periode yang dipilih.
                            </p>
                        </div>
                        <a
                            href={
                                '/reports/export' +
                                (exportParams ? '?' + exportParams : '')
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-800"
                        >
                            <Download size={16} /> Unduh CSV
                        </a>
                    </header>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get('/reports', form, {
                                preserveScroll: true,
                                preserveState: true,
                            });
                        }}
                        className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                    >
                        <div className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                            <Filter size={16} className="text-teal-700" />{' '}
                            Filter laporan
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            <label className="text-xs font-bold text-slate-600">
                                Dari tanggal
                                <input
                                    type="date"
                                    value={form.from}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            from: event.target.value,
                                        })
                                    }
                                    className={inputClass}
                                    required
                                />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                                Sampai tanggal
                                <input
                                    type="date"
                                    value={form.to}
                                    min={form.from}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            to: event.target.value,
                                        })
                                    }
                                    className={inputClass}
                                    required
                                />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                                Cabang
                                <select
                                    value={form.branch_id}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            branch_id: event.target.value,
                                            service_id: '',
                                            staff_id: '',
                                        })
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Semua cabang</option>
                                    {branches.map((branch) => (
                                        <option
                                            value={branch.id}
                                            key={branch.id}
                                        >
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                                Layanan
                                <select
                                    value={form.service_id}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            service_id: event.target.value,
                                        })
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Semua layanan</option>
                                    {visibleServices.map((service) => (
                                        <option
                                            value={service.id}
                                            key={service.id}
                                        >
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                                Petugas
                                <select
                                    value={form.staff_id}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            staff_id: event.target.value,
                                        })
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Semua petugas</option>
                                    {visibleStaff.map((person) => (
                                        <option
                                            value={person.id}
                                            key={person.id}
                                        >
                                            {person.name} · {person.role}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-teal-800">
                                Terapkan filter
                            </button>
                            <Link
                                href="/reports"
                                preserveState={false}
                                className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            >
                                Atur ulang
                            </Link>
                            <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-400">
                                <CalendarDays size={14} /> Maksimal 366 hari per
                                unduhan
                            </span>
                        </div>
                    </form>

                    <section
                        aria-label="Ringkasan metrik"
                        className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                    >
                        <Stat
                            label="Total reservasi & antrean"
                            value={stats.total}
                            icon={Users}
                            tone="slate"
                            note={
                                stats.scheduled +
                                ' terjadwal · ' +
                                stats.waiting +
                                ' sedang berjalan'
                            }
                        />
                        <Stat
                            label="Selesai"
                            value={stats.completed}
                            icon={CheckCircle2}
                            tone="green"
                            note="Layanan yang tuntas"
                        />
                        <Stat
                            label="Waktu tunggu rata-rata"
                            value={minutes(stats.average_wait_minutes)}
                            icon={Clock3}
                            tone="blue"
                            note="Check-in hingga mulai dilayani"
                        />
                        <Stat
                            label="Durasi layanan rata-rata"
                            value={minutes(stats.average_service_minutes)}
                            icon={Clock3}
                            tone="teal"
                            note="Mulai hingga selesai dilayani"
                        />
                        <Stat
                            label="Masih dalam antrean"
                            value={stats.waiting}
                            icon={Users}
                            tone="amber"
                            note="Menunggu, dipanggil, atau dilayani"
                        />
                        <Stat
                            label="Ditunda"
                            value={stats.paused}
                            icon={PauseCircle}
                            tone="slate"
                            note="Antrean yang dijeda petugas"
                        />
                        <Stat
                            label="Dibatalkan"
                            value={stats.cancelled}
                            icon={XCircle}
                            tone="rose"
                            note="Reservasi yang dibatalkan"
                        />
                        <Stat
                            label="Tidak hadir"
                            value={stats.no_show}
                            icon={XCircle}
                            tone="rose"
                            note="Pelanggan tidak datang saat dipanggil"
                        />
                    </section>

                    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                            <div>
                                <h2 className="text-base font-extrabold">
                                    Riwayat reservasi dan antrean
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    {bookings.total} catatan · menampilkan{' '}
                                    {bookings.from ?? 0}–{bookings.to ?? 0}
                                </p>
                            </div>
                            <span className="text-xs font-medium text-slate-400">
                                Waktu mengikuti zona waktu cabang.
                            </span>
                        </div>
                        {bookings.data.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                                    <CalendarDays size={21} />
                                </span>
                                <h3 className="mt-4 text-sm font-extrabold">
                                    {has_bookings
                                        ? 'Belum ada data pada periode ini'
                                        : 'Belum ada reservasi untuk dilaporkan'}
                                </h3>
                                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                                    {has_bookings
                                        ? 'Usaha sudah memiliki transaksi, tetapi tidak ada yang cocok dengan tanggal atau filter ini. Coba perluas rentang tanggal atau atur ulang filter.'
                                        : 'Laporan akan terisi otomatis setelah pelanggan membuat janji temu atau petugas menambahkan antrean langsung.'}
                                </p>
                                {!has_bookings && (
                                    <Link
                                        href="/dashboard"
                                        className="mt-4 inline-flex items-center justify-center rounded-xl border border-teal-200 bg-white/80 px-4 py-2.5 text-xs font-extrabold text-teal-800 shadow-sm transition hover:bg-teal-50"
                                    >
                                        Buka ruang kerja
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-left text-sm">
                                    <thead className="bg-slate-50 text-[11px] font-extrabold tracking-wide text-slate-400 uppercase">
                                        <tr>
                                            <th className="px-5 py-3">
                                                Tanggal
                                            </th>
                                            <th className="px-5 py-3">
                                                Pelanggan
                                            </th>
                                            <th className="px-5 py-3">
                                                Layanan / cabang
                                            </th>
                                            <th className="px-5 py-3">Nomor</th>
                                            <th className="px-5 py-3">
                                                Status
                                            </th>
                                            <th className="px-5 py-3">Jenis</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {bookings.data.map((booking) => (
                                            <tr
                                                key={booking.id}
                                                className="hover:bg-slate-50/70"
                                            >
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="font-bold">
                                                        {booking.date}
                                                    </span>
                                                    <span className="mt-1 block text-xs text-slate-500">
                                                        {booking.time}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="block font-bold text-slate-800">
                                                        {booking.customer_name}
                                                    </span>
                                                    <span className="mt-1 block text-xs text-slate-500">
                                                        {booking.customer_phone}{' '}
                                                        · {booking.code}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="block font-semibold">
                                                        {booking.service}
                                                    </span>
                                                    <span className="mt-1 block text-xs text-slate-500">
                                                        {booking.branch}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 font-extrabold text-teal-800">
                                                    {booking.queue_number
                                                        ? 'A-' +
                                                          String(
                                                              booking.queue_number,
                                                          ).padStart(3, '0')
                                                        : '—'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        status={booking.status}
                                                    />
                                                </td>
                                                <td className="px-5 py-4 text-xs text-slate-500">
                                                    {booking.type === 'walk_in'
                                                        ? 'Antrean langsung'
                                                        : 'Janji temu'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {bookings.links.length > 3 && (
                            <nav
                                aria-label="Halaman laporan"
                                className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 p-4"
                            >
                                {bookings.links.map((link, index) => {
                                    const label = paginationLabel(link.label);
                                    const className =
                                        'min-w-9 rounded-lg px-3 py-2 text-center text-xs font-bold ' +
                                        (link.active
                                            ? 'bg-teal-700 text-white'
                                            : link.url
                                              ? 'text-slate-600 hover:bg-slate-100'
                                              : 'cursor-not-allowed text-slate-300');
                                    return link.url && !link.active ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            preserveScroll
                                            className={className}
                                        >
                                            {label}
                                        </Link>
                                    ) : (
                                        <span
                                            key={index}
                                            aria-current={
                                                link.active ? 'page' : undefined
                                            }
                                            aria-disabled={!link.url}
                                            className={className}
                                        >
                                            {label}
                                        </span>
                                    );
                                })}
                            </nav>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

function Stat({
    label,
    value,
    icon: Icon,
    tone,
    note,
}: {
    label: string;
    value: number | string;
    icon: typeof Users;
    tone: string;
    note: string;
}) {
    const tones: Record<string, string> = {
        slate: 'bg-slate-100 text-slate-700',
        green: 'bg-emerald-50 text-emerald-700',
        blue: 'bg-sky-50 text-sky-700',
        teal: 'bg-teal-50 text-teal-700',
        amber: 'bg-amber-50 text-amber-700',
        rose: 'bg-rose-50 text-rose-700',
    };
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold text-slate-500">
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-black tracking-tight">
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
                {note}
            </p>
        </article>
    );
}

function StatusBadge({ status }: { status: string }) {
    const tone: Record<string, string> = {
        scheduled: 'bg-violet-50 text-violet-700',
        waiting: 'bg-amber-50 text-amber-700',
        called: 'bg-sky-50 text-sky-700',
        in_service: 'bg-teal-50 text-teal-700',
        completed: 'bg-emerald-50 text-emerald-700',
        cancelled: 'bg-slate-100 text-slate-600',
        no_show: 'bg-rose-50 text-rose-700',
        paused: 'bg-slate-100 text-slate-600',
    };
    return (
        <span
            className={
                'inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ' +
                (tone[status] ?? 'bg-slate-100 text-slate-600')
            }
        >
            {statusLabels[status] ?? status}
        </span>
    );
}

function minutes(value: number | null): string {
    return value === null ? 'Belum ada data' : value + ' menit';
}
function paginationLabel(label: string): string {
    if (label.includes('Previous')) return '‹ Sebelumnya';
    if (label.includes('Next')) return 'Berikutnya ›';
    return label;
}

const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';
