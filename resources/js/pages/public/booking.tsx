import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Building2,
    CalendarDays,
    Check,
    Clock3,
    MapPin,
    Phone,
    ShieldCheck,
    Sparkles,
    TicketCheck,
    Users,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';

type Service = {
    id: number;
    name: string;
    description: string | null;
    duration_minutes: number;
    slot_capacity: number;
    allow_walk_ins: boolean;
};
type Branch = {
    id: number;
    name: string;
    address: string;
    timezone: string;
    queue_enabled: boolean;
    accepts_appointments: boolean;
    opening_time: string;
    closing_time: string;
    working_days: number[];
    closed_dates: string[];
    booking_advance_days: number;
    cancellation_cutoff_minutes: number;
    services: Service[];
};
type Slot = { value: string; label: string };
type Props = {
    business: {
        name: string;
        slug: string;
        category: string;
        phone: string | null;
    };
    branches: Branch[];
    selected_branch_id: number;
    selected_service_id: number | null;
    selected_date: string;
    available_slots: Slot[];
    walk_in_unavailable_reason: string | null;
    today: string;
    max_booking_date: string;
};
type BookingForm = {
    branch_id: number;
    service_id: number | string;
    type: 'appointment' | 'walk_in';
    scheduled_for: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
};

export default function PublicBooking({
    business,
    branches,
    selected_branch_id,
    selected_service_id,
    selected_date,
    available_slots,
    walk_in_unavailable_reason,
    today,
    max_booking_date,
}: Props) {
    const branch =
        branches.find((item) => item.id === selected_branch_id) ?? branches[0];
    const service =
        branch?.services.find((item) => item.id === selected_service_id) ??
        branch?.services[0];
    const selectedDateClosed =
        branch?.closed_dates?.includes(selected_date) ?? false;
    const canWalkIn = Boolean(
        branch?.queue_enabled &&
        service?.allow_walk_ins &&
        !walk_in_unavailable_reason,
    );
    const hasBookingMethod = Boolean(branch?.accepts_appointments || canWalkIn);
    const form = useForm<BookingForm>({
        branch_id: branch?.id ?? 0,
        service_id: service?.id ?? '',
        type: branch?.accepts_appointments ? 'appointment' : 'walk_in',
        scheduled_for: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
    });
    const selectedSlot = available_slots.find(
        (slot) => slot.value === form.data.scheduled_for,
    );

    const updateSelection = (next: {
        branch?: number;
        service?: number;
        date?: string;
    }) => {
        const query = {
            branch: next.branch ?? branch?.id,
            service: next.service ?? service?.id,
            date: next.date ?? selected_date,
        };
        router.get('/usaha/' + business.slug, query, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    return (
        <>
            <Head title={'Reservasi — ' + business.name} />
            <div className="antrein-ambient antrein-public-booking min-h-screen text-slate-900">
                <header className="antrein-public-header sticky top-0 z-30">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
                        <Link
                            href="/"
                            className="group flex items-center gap-3"
                            aria-label="Kembali ke Antrein"
                        >
                            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-800 text-white shadow-lg shadow-teal-900/15 transition-transform group-hover:scale-105 group-hover:-rotate-3">
                                <AppLogoIcon className="size-6" />
                            </span>
                            <span>
                                <span className="block text-base font-black tracking-tight text-slate-900">
                                    antrein
                                    <span className="text-teal-600">.</span>
                                </span>
                                <span className="block text-[10px] font-semibold tracking-wide text-slate-500">
                                    Reservasi lebih tertata
                                </span>
                            </span>
                        </Link>
                        <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/70 px-3.5 py-2 text-xs font-bold text-teal-800 shadow-sm backdrop-blur">
                            <ShieldCheck size={15} /> Pemesanan aman
                        </span>
                    </div>
                </header>
                <main className="relative mx-auto grid max-w-7xl gap-7 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[.92fr_1.08fr] lg:gap-10">
                    <section className="lg:sticky lg:top-8 lg:self-start">
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-100/80 bg-white/75 px-3.5 py-2 text-xs font-extrabold text-teal-800 shadow-sm backdrop-blur">
                            <Sparkles size={14} /> PEMESANAN ONLINE
                        </div>
                        <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                            Buat reservasi
                            <br />
                            <span className="text-teal-700">
                                tanpa menebak antrean.
                            </span>
                        </h1>
                        <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
                            Pilih layanan dan waktu yang tersedia. Setelah
                            reservasi, Anda mendapat kode pribadi untuk memantau
                            status atau mengubah jadwal.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-bold text-slate-600">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/90 bg-white/65 px-3 py-2 shadow-sm backdrop-blur">
                                <BadgeCheck
                                    size={14}
                                    className="text-teal-700"
                                />{' '}
                                Jadwal jelas
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/90 bg-white/65 px-3 py-2 shadow-sm backdrop-blur">
                                <TicketCheck
                                    size={14}
                                    className="text-teal-700"
                                />{' '}
                                Status mudah dipantau
                            </span>
                        </div>
                        <div className="antrein-glass-panel antrein-business-card mt-7 overflow-hidden rounded-[28px] p-5 sm:p-6">
                            <div
                                aria-hidden="true"
                                className="absolute -top-12 -right-8 size-40 rounded-full bg-teal-100/70 blur-3xl"
                            />
                            <div className="relative flex items-start gap-4">
                                <span className="grid size-14 shrink-0 place-items-center rounded-[20px] bg-gradient-to-br from-teal-600 to-emerald-800 text-xl font-black text-white shadow-lg shadow-teal-900/15">
                                    {business.name.slice(0, 1).toUpperCase()}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-black tracking-[.18em] text-teal-700 uppercase">
                                        Profil usaha
                                    </p>
                                    <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
                                        {business.name}
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {categoryLabel(business.category)}
                                    </p>
                                </div>
                                <span className="grid size-9 place-items-center rounded-xl border border-white/90 bg-white/70 text-teal-700 shadow-sm">
                                    <Building2 size={17} />
                                </span>
                            </div>
                            <div className="relative mt-5 space-y-4 border-t border-white/80 pt-5">
                                <div className="flex items-start gap-3 text-sm text-slate-600">
                                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                                        <MapPin size={16} />
                                    </span>
                                    <div>
                                        <p className="font-bold text-slate-800">
                                            {branch?.name}
                                        </p>
                                        <p className="mt-0.5 text-xs leading-5">
                                            {branch?.address}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
                                        <Clock3 size={16} />
                                    </span>
                                    <span className="text-xs leading-5">
                                        Jam layanan{' '}
                                        <strong className="text-slate-700">
                                            {branch?.opening_time}–
                                            {branch?.closing_time}{' '}
                                            {timezoneLabel(branch?.timezone)}
                                        </strong>
                                    </span>
                                </div>
                                {business.phone && (
                                    <a
                                        href={
                                            'tel:' +
                                            business.phone.replace(
                                                /[^\d+]/g,
                                                '',
                                            )
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl border border-teal-100 bg-white/70 px-3 py-2.5 text-xs font-bold text-teal-800 transition hover:border-teal-300 hover:bg-white"
                                    >
                                        <Phone size={14} /> Hubungi usaha{' '}
                                        <span className="font-medium text-slate-500">
                                            {business.phone}
                                        </span>
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="antrein-glass-note mt-4 flex gap-3 rounded-2xl p-4 text-xs leading-5 text-sky-950">
                            <ShieldCheck
                                size={17}
                                className="mt-0.5 shrink-0 text-sky-700"
                            />
                            <p>
                                <strong className="font-extrabold">
                                    Privasi Anda dijaga.
                                </strong>{' '}
                                Antrein hanya meminta nama dan kontak untuk
                                mengelola reservasi. Jangan masukkan informasi
                                kesehatan atau data sensitif di formulir ini.
                            </p>
                        </div>
                    </section>

                    <section className="antrein-glass-panel rounded-[30px] p-5 sm:p-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black tracking-[.19em] text-teal-700 uppercase">
                                    Langkah pemesanan
                                </p>
                                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                                    Pilih layanan Anda
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    Reservasi atau masuk ke antrean hari ini.
                                </p>
                            </div>
                            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                                <CalendarDays size={20} />
                            </span>
                        </div>
                        <div
                            className="antrein-booking-steps mt-6 grid grid-cols-3 gap-2"
                            aria-label="Tiga langkah pemesanan"
                        >
                            <div>
                                <span>01</span>
                                <p>Layanan</p>
                            </div>
                            <div>
                                <span>02</span>
                                <p>Waktu</p>
                            </div>
                            <div>
                                <span>03</span>
                                <p>Data Anda</p>
                            </div>
                        </div>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                form.post(
                                    '/usaha/' + business.slug + '/reservasi',
                                );
                            }}
                        >
                            {branches.length > 1 && (
                                <label className="mt-6 block text-sm font-bold text-slate-700">
                                    Cabang
                                    <select
                                        value={branch?.id}
                                        onChange={(e) =>
                                            updateSelection({
                                                branch: Number(e.target.value),
                                            })
                                        }
                                        className={inputClass}
                                    >
                                        {branches.map((item) => (
                                            <option
                                                value={item.id}
                                                key={item.id}
                                            >
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            )}
                            <label className="mt-5 block text-sm font-bold text-slate-700">
                                Pilih layanan
                                <select
                                    value={service?.id ?? ''}
                                    onChange={(e) =>
                                        updateSelection({
                                            service: Number(e.target.value),
                                        })
                                    }
                                    className={inputClass}
                                    disabled={!branch?.services.length}
                                >
                                    <option value="" disabled>
                                        Pilih layanan
                                    </option>
                                    {branch?.services.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} ·{' '}
                                            {item.duration_minutes} menit
                                        </option>
                                    ))}
                                </select>
                                {form.errors.service_id && (
                                    <ErrorText>
                                        {form.errors.service_id}
                                    </ErrorText>
                                )}
                            </label>
                            {service && (
                                <div className="antrein-service-summary mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
                                    <div className="flex items-start gap-2.5">
                                        <span className="mt-0.5 text-teal-700">
                                            <Clock3 size={16} />
                                        </span>
                                        <div>
                                            <p className="text-xs font-extrabold text-slate-800">
                                                Durasi layanan{' '}
                                                {service.duration_minutes} menit
                                            </p>
                                            {service.description && (
                                                <p className="mt-1 max-w-lg text-xs leading-5 text-slate-500">
                                                    {service.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm">
                                        <Users
                                            size={13}
                                            className="text-teal-700"
                                        />
                                        {service.slot_capacity} slot per waktu
                                    </span>
                                </div>
                            )}

                            {branch?.accepts_appointments && (
                                <div className="mt-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-slate-700">
                                            Pilih tanggal
                                        </p>
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                                            <CalendarDays size={14} /> Jadwal
                                            tersedia
                                        </span>
                                    </div>
                                    <input
                                        type="date"
                                        min={today}
                                        max={max_booking_date}
                                        value={selected_date}
                                        onChange={(e) =>
                                            updateSelection({
                                                date: e.target.value,
                                            })
                                        }
                                        className={inputClass}
                                    />
                                    <p className="mt-4 text-sm font-bold text-slate-700">
                                        Pilih waktu
                                    </p>
                                    {available_slots.length === 0 ? (
                                        <div
                                            role="status"
                                            className="antrein-availability-empty mt-2 flex gap-3 rounded-2xl p-4"
                                        >
                                            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/80 text-amber-700 shadow-sm">
                                                <Clock3 size={17} />
                                            </span>
                                            <div>
                                                <p className="text-xs font-extrabold text-amber-950">
                                                    Belum ada jadwal tersedia
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-amber-900">
                                                    {selectedDateClosed
                                                        ? 'Cabang tutup pada tanggal ini. Silakan pilih tanggal lain.'
                                                        : canWalkIn
                                                          ? 'Tidak ada slot pada tanggal ini. Pilih tanggal lain atau aktifkan antrean langsung.'
                                                          : 'Coba tanggal lain atau hubungi usaha untuk mengetahui jadwal berikutnya.'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                                            {available_slots.map((slot) => (
                                                <button
                                                    type="button"
                                                    key={slot.value}
                                                    aria-pressed={
                                                        form.data
                                                            .scheduled_for ===
                                                        slot.value
                                                    }
                                                    onClick={() =>
                                                        form.setData(
                                                            'scheduled_for',
                                                            slot.value,
                                                        )
                                                    }
                                                    className={
                                                        'rounded-xl border px-3 py-3 text-sm font-extrabold transition ' +
                                                        (form.data
                                                            .scheduled_for ===
                                                        slot.value
                                                            ? 'border-teal-700 bg-teal-700 text-white shadow-md shadow-teal-900/10'
                                                            : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50')
                                                    }
                                                >
                                                    {slot.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {selectedSlot && (
                                        <p className="antrein-selected-slot mt-3 rounded-xl px-3 py-2.5 text-xs">
                                            Waktu yang dipilih{' '}
                                            <strong>
                                                {selectedSlot.label}
                                            </strong>
                                        </p>
                                    )}
                                    {form.errors.scheduled_for && (
                                        <ErrorText>
                                            {form.errors.scheduled_for}
                                        </ErrorText>
                                    )}
                                </div>
                            )}

                            {branch?.queue_enabled &&
                                service?.allow_walk_ins && (
                                    <div className="antrein-walkin-card mt-6 rounded-2xl p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-extrabold">
                                                    Antrean langsung
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Datang hari ini dan dapatkan
                                                    nomor antrean.
                                                </p>
                                            </div>
                                            {branch.accepts_appointments ? (
                                                <button
                                                    type="button"
                                                    disabled={!canWalkIn}
                                                    onClick={() => {
                                                        form.setData(
                                                            'type',
                                                            form.data.type ===
                                                                'walk_in'
                                                                ? 'appointment'
                                                                : 'walk_in',
                                                        );
                                                        form.setData(
                                                            'scheduled_for',
                                                            '',
                                                        );
                                                    }}
                                                    className={
                                                        'relative h-7 w-12 rounded-full transition disabled:cursor-not-allowed disabled:opacity-45 ' +
                                                        (form.data.type ===
                                                        'walk_in'
                                                            ? 'bg-teal-700'
                                                            : 'bg-slate-200')
                                                    }
                                                    aria-pressed={
                                                        form.data.type ===
                                                        'walk_in'
                                                    }
                                                    aria-label="Pilih antrean langsung"
                                                >
                                                    <span
                                                        className={
                                                            'absolute top-1 size-5 rounded-full bg-white shadow transition-all ' +
                                                            (form.data.type ===
                                                            'walk_in'
                                                                ? 'left-6'
                                                                : 'left-1')
                                                        }
                                                    />
                                                </button>
                                            ) : (
                                                <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                                                    Metode pemesanan
                                                </span>
                                            )}
                                        </div>
                                        {walk_in_unavailable_reason && (
                                            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
                                                {walk_in_unavailable_reason}
                                            </p>
                                        )}
                                        {form.data.type === 'walk_in' && (
                                            <div className="mt-3 flex items-start gap-2 rounded-xl bg-teal-50 p-3 text-xs leading-5 text-teal-900">
                                                <Check
                                                    size={15}
                                                    className="mt-0.5 shrink-0"
                                                />
                                                Nomor antrean hanya berlaku hari
                                                ini. Pantau posisi melalui
                                                halaman status setelah
                                                mendaftar.
                                            </div>
                                        )}
                                        {form.errors.type && (
                                            <ErrorText>
                                                {form.errors.type}
                                            </ErrorText>
                                        )}
                                    </div>
                                )}
                            {!hasBookingMethod && (
                                <div
                                    role="status"
                                    className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
                                >
                                    Saat ini belum tersedia metode pemesanan
                                    untuk layanan ini. Hubungi usaha untuk
                                    bantuan.
                                </div>
                            )}

                            <div className="mt-6 border-t border-slate-100 pt-6">
                                <p className="mb-4 text-sm font-extrabold">
                                    Informasi pelanggan
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
                                        Nama lengkap
                                        <input
                                            value={form.data.customer_name}
                                            onChange={(e) =>
                                                form.setData(
                                                    'customer_name',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass}
                                            placeholder="Nama Anda"
                                            autoComplete="name"
                                            required
                                        />
                                        {form.errors.customer_name && (
                                            <ErrorText>
                                                {form.errors.customer_name}
                                            </ErrorText>
                                        )}
                                    </label>
                                    <label className="block text-sm font-bold text-slate-700">
                                        Nomor telepon
                                        <input
                                            value={form.data.customer_phone}
                                            onChange={(e) =>
                                                form.setData(
                                                    'customer_phone',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass}
                                            placeholder="08xxxxxxxxxx"
                                            autoComplete="tel"
                                            required
                                        />
                                        {form.errors.customer_phone && (
                                            <ErrorText>
                                                {form.errors.customer_phone}
                                            </ErrorText>
                                        )}
                                    </label>
                                    <label className="block text-sm font-bold text-slate-700">
                                        Email (opsional)
                                        <input
                                            type="email"
                                            value={form.data.customer_email}
                                            onChange={(e) =>
                                                form.setData(
                                                    'customer_email',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass}
                                            placeholder="nama@email.com"
                                            autoComplete="email"
                                        />
                                        {form.errors.customer_email && (
                                            <ErrorText>
                                                {form.errors.customer_email}
                                            </ErrorText>
                                        )}
                                    </label>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={
                                    form.processing ||
                                    !service ||
                                    !hasBookingMethod ||
                                    (form.data.type === 'appointment' &&
                                        (!branch?.accepts_appointments ||
                                            !form.data.scheduled_for)) ||
                                    (form.data.type === 'walk_in' && !canWalkIn)
                                }
                                className="antrein-submit-button mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-teal-900/10 hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                {form.processing
                                    ? 'Menyimpan reservasi…'
                                    : form.data.type === 'walk_in'
                                      ? 'Ambil nomor antrean'
                                      : 'Konfirmasi reservasi'}{' '}
                                <ArrowRight size={16} />
                            </button>
                            <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                                Dengan melanjutkan, Anda setuju menggunakan data
                                kontak untuk mengelola reservasi ini.{' '}
                                <Link
                                    href="/privasi"
                                    className="font-bold text-teal-800 underline"
                                >
                                    Kebijakan privasi
                                </Link>{' '}
                                ·{' '}
                                <Link
                                    href="/ketentuan"
                                    className="font-bold text-teal-800 underline"
                                >
                                    Ketentuan
                                </Link>
                                .
                            </p>
                        </form>
                    </section>
                </main>
            </div>
        </>
    );
}

function timezoneLabel(timezone?: string) {
    return timezone === 'Asia/Makassar'
        ? 'WITA'
        : timezone === 'Asia/Jayapura'
          ? 'WIT'
          : timezone === 'UTC'
            ? 'UTC'
            : 'WIB';
}
function categoryLabel(category: string) {
    return (
        (
            {
                clinic: 'Klinik / praktik',
                barbershop: 'Barbershop / salon',
                workshop: 'Bengkel / servis',
                other: 'Layanan lainnya',
            } as Record<string, string>
        )[category] ?? category.replaceAll('_', ' ')
    );
}

function ErrorText({ children }: { children?: string }) {
    return children ? (
        <span className="mt-1 block text-xs font-medium text-rose-600">
            {children}
        </span>
    ) : null;
}
const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';
