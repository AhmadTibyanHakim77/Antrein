import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Check,
    Clock3,
    Plus,
    Save,
    Settings2,
    X,
} from 'lucide-react';
import { useState } from 'react';

type BranchOption = { id: number; name: string };
type Branch = BranchOption & {
    address: string;
    phone: string | null;
    timezone: string;
    opening_time: string;
    closing_time: string;
    call_grace_minutes: number;
    max_call_attempts: number;
    closed_dates: string[];
    booking_advance_days: number;
    cancellation_cutoff_minutes: number;
    working_days: number[];
    queue_enabled: boolean;
    accepts_appointments: boolean;
};
type Business = {
    id: number;
    name: string;
    category: string;
    phone: string | null;
};
type Props = {
    business: Business;
    branches: BranchOption[];
    branch: Branch;
    flash?: string | null;
    flash_error?: string | null;
};
type SettingsForm = {
    branch_id: number;
    business_name: string;
    category: string;
    business_phone: string;
    branch_name: string;
    branch_address: string;
    branch_phone: string;
    timezone: string;
    opening_time: string;
    closing_time: string;
    call_grace_minutes: number;
    max_call_attempts: number;
    closed_dates: string[];
    booking_advance_days: number;
    cancellation_cutoff_minutes: number;
    working_days: number[];
    queue_enabled: boolean;
    accepts_appointments: boolean;
};
type NewBranchForm = {
    name: string;
    address: string;
    phone: string;
    opening_time: string;
    closing_time: string;
    working_days: number[];
};

const days = [
    { value: 1, label: 'Sen' },
    { value: 2, label: 'Sel' },
    { value: 3, label: 'Rab' },
    { value: 4, label: 'Kam' },
    { value: 5, label: 'Jum' },
    { value: 6, label: 'Sab' },
    { value: 7, label: 'Min' },
];

export default function BusinessSettings({
    business,
    branches,
    branch,
    flash,
    flash_error,
}: Props) {
    const form = useForm<SettingsForm>({
        branch_id: branch.id,
        business_name: business.name,
        category: business.category,
        business_phone: business.phone ?? '',
        branch_name: branch.name,
        branch_address: branch.address,
        branch_phone: branch.phone ?? '',
        timezone: branch.timezone,
        opening_time: branch.opening_time,
        closing_time: branch.closing_time,
        call_grace_minutes: branch.call_grace_minutes,
        max_call_attempts: branch.max_call_attempts,
        closed_dates: branch.closed_dates ?? [],
        booking_advance_days: branch.booking_advance_days,
        cancellation_cutoff_minutes: branch.cancellation_cutoff_minutes,
        working_days: branch.working_days,
        queue_enabled: branch.queue_enabled,
        accepts_appointments: branch.accepts_appointments,
    });
    const [closedDate, setClosedDate] = useState('');
    const newBranch = useForm<NewBranchForm>({
        name: '',
        address: '',
        phone: '',
        opening_time: '09:00',
        closing_time: '17:00',
        working_days: [1, 2, 3, 4, 5, 6],
    });
    const changeBranch = (id: number) =>
        router.get(
            '/business/settings',
            { branch_id: id },
            { preserveState: false },
        );
    const addClosedDate = () => {
        if (closedDate && !form.data.closed_dates.includes(closedDate))
            form.setData(
                'closed_dates',
                [...form.data.closed_dates, closedDate].sort(),
            );
        setClosedDate('');
    };
    const removeClosedDate = (date: string) =>
        form.setData(
            'closed_dates',
            form.data.closed_dates.filter((item) => item !== date),
        );
    const toggleDay = (day: number) =>
        form.setData(
            'working_days',
            form.data.working_days.includes(day)
                ? form.data.working_days.filter((item) => item !== day)
                : [...form.data.working_days, day].sort((a, b) => a - b),
        );
    const toggleNewDay = (day: number) =>
        newBranch.setData(
            'working_days',
            newBranch.data.working_days.includes(day)
                ? newBranch.data.working_days.filter((item) => item !== day)
                : [...newBranch.data.working_days, day].sort((a, b) => a - b),
        );

    return (
        <>
            <Head title="Pengaturan usaha — Antrein" />
            <div className="antrein-ambient min-h-screen bg-[#f6f8f8] text-slate-900">
                <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-xs font-black tracking-[.18em] text-teal-700 uppercase">
                                Profil dan operasional
                            </p>
                            <h1 className="mt-1 text-3xl font-black tracking-tight">
                                Pengaturan usaha
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Ubah profil, jam kerja, dan ketersediaan antrean
                                pelanggan.
                            </p>
                        </div>
                        {branches.length > 1 && (
                            <label className="text-xs font-bold text-slate-500">
                                Pilih cabang
                                <select
                                    value={branch.id}
                                    onChange={(e) =>
                                        changeBranch(Number(e.target.value))
                                    }
                                    className={inputClass}
                                >
                                    {branches.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </div>
                    {flash && (
                        <div
                            role="status"
                            className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
                        >
                            <Check size={16} />
                            {flash}
                        </div>
                    )}
                    {flash_error && (
                        <p
                            role="alert"
                            className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                        >
                            {flash_error}
                        </p>
                    )}
                    <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.7fr)]">
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                                    <Settings2 size={18} />
                                </span>
                                <div>
                                    <h2 className="text-lg font-extrabold">
                                        Profil dan cabang aktif
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Informasi ini ditampilkan kepada
                                        pelanggan.
                                    </p>
                                </div>
                            </div>
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.put('/business/settings', {
                                        preserveScroll: true,
                                    });
                                }}
                                className="space-y-5"
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        label="Nama usaha"
                                        error={form.errors.business_name}
                                    >
                                        <input
                                            value={form.data.business_name}
                                            onChange={(e) =>
                                                form.setData(
                                                    'business_name',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass}
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Jenis usaha"
                                        error={form.errors.category}
                                    >
                                        <select
                                            value={form.data.category}
                                            onChange={(e) =>
                                                form.setData(
                                                    'category',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option value="clinic">
                                                Klinik / praktik
                                            </option>
                                            <option value="barbershop">
                                                Barbershop / salon
                                            </option>
                                            <option value="workshop">
                                                Bengkel / servis
                                            </option>
                                            <option value="other">
                                                Layanan lainnya
                                            </option>
                                        </select>
                                    </Field>
                                    <Field
                                        label="Telepon usaha"
                                        error={form.errors.business_phone}
                                    >
                                        <input
                                            value={form.data.business_phone}
                                            onChange={(e) =>
                                                form.setData(
                                                    'business_phone',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </Field>
                                    <Field
                                        label="Nama cabang"
                                        error={form.errors.branch_name}
                                    >
                                        <input
                                            value={form.data.branch_name}
                                            onChange={(e) =>
                                                form.setData(
                                                    'branch_name',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass}
                                            required
                                        />
                                    </Field>
                                    <div className="sm:col-span-2">
                                        <Field
                                            label="Alamat cabang"
                                            error={form.errors.branch_address}
                                        >
                                            <textarea
                                                value={form.data.branch_address}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'branch_address',
                                                        e.target.value,
                                                    )
                                                }
                                                className={
                                                    inputClass +
                                                    ' min-h-24 resize-y'
                                                }
                                                required
                                            />
                                        </Field>
                                    </div>
                                    <Field
                                        label="Zona waktu"
                                        error={form.errors.timezone}
                                    >
                                        <select
                                            value={form.data.timezone}
                                            onChange={(e) =>
                                                form.setData(
                                                    'timezone',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option value="Asia/Jakarta">
                                                WIB · Jakarta
                                            </option>
                                            <option value="Asia/Makassar">
                                                WITA · Makassar
                                            </option>
                                            <option value="Asia/Jayapura">
                                                WIT · Jayapura
                                            </option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                    </Field>
                                    <Field
                                        label="Telepon cabang"
                                        error={form.errors.branch_phone}
                                    >
                                        <input
                                            value={form.data.branch_phone}
                                            onChange={(e) =>
                                                form.setData(
                                                    'branch_phone',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </Field>
                                </div>
                                <div>
                                    <p className="mb-3 flex items-center gap-2 text-sm font-extrabold">
                                        <Clock3
                                            size={16}
                                            className="text-teal-700"
                                        />{' '}
                                        Jam operasional
                                    </p>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field
                                            label="Buka"
                                            error={form.errors.opening_time}
                                        >
                                            <input
                                                type="time"
                                                value={form.data.opening_time}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'opening_time',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                                required
                                            />
                                        </Field>
                                        <Field
                                            label="Tutup"
                                            error={form.errors.closing_time}
                                        >
                                            <input
                                                type="time"
                                                value={form.data.closing_time}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'closing_time',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                                required
                                            />
                                        </Field>
                                    </div>
                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <Field
                                                label="Toleransi pemanggilan (menit)"
                                                error={
                                                    form.errors
                                                        .call_grace_minutes
                                                }
                                            >
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={60}
                                                    value={
                                                        form.data
                                                            .call_grace_minutes
                                                    }
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'call_grace_minutes',
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    className={inputClass}
                                                    required
                                                />
                                            </Field>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Tunggu sebelum tiket dapat
                                                ditandai tidak hadir.
                                            </p>
                                        </div>
                                        <div>
                                            <Field
                                                label="Maksimum panggilan per pelanggan"
                                                error={
                                                    form.errors
                                                        .max_call_attempts
                                                }
                                            >
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={10}
                                                    value={
                                                        form.data
                                                            .max_call_attempts
                                                    }
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'max_call_attempts',
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    className={inputClass}
                                                    required
                                                />
                                            </Field>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Termasuk panggilan pertama;
                                                setelah batas tercapai, panggil
                                                ulang dinonaktifkan.
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-4 mb-2 text-xs font-bold text-slate-500">
                                        Hari buka · sesuai zona waktu cabang
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {days.map((day) => {
                                            const active =
                                                form.data.working_days.includes(
                                                    day.value,
                                                );
                                            return (
                                                <button
                                                    type="button"
                                                    key={day.value}
                                                    onClick={() =>
                                                        toggleDay(day.value)
                                                    }
                                                    aria-pressed={active}
                                                    className={
                                                        'min-w-14 rounded-lg border px-3 py-2 text-xs font-extrabold ' +
                                                        (active
                                                            ? 'border-teal-700 bg-teal-700 text-white'
                                                            : 'border-slate-200 text-slate-500 hover:border-teal-300')
                                                    }
                                                >
                                                    {day.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {form.errors.working_days && (
                                        <ErrorText>
                                            {form.errors.working_days}
                                        </ErrorText>
                                    )}
                                    <div className="mt-5 rounded-xl border border-slate-200 p-4">
                                        <p className="text-sm font-extrabold">
                                            Tanggal libur
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Pelanggan tidak dapat memesan pada
                                            tanggal yang ditutup khusus.
                                        </p>
                                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                            <input
                                                type="date"
                                                value={closedDate}
                                                onChange={(event) =>
                                                    setClosedDate(
                                                        event.target.value,
                                                    )
                                                }
                                                className={
                                                    inputClass + ' mt-0 flex-1'
                                                }
                                                aria-label="Pilih tanggal libur"
                                            />
                                            <button
                                                type="button"
                                                onClick={addClosedDate}
                                                disabled={
                                                    !closedDate ||
                                                    form.data.closed_dates.includes(
                                                        closedDate,
                                                    )
                                                }
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-extrabold text-slate-700 hover:border-teal-300 disabled:opacity-40"
                                            >
                                                <Plus size={14} />
                                                Tambah tanggal
                                            </button>
                                        </div>
                                        {form.errors.closed_dates && (
                                            <ErrorText>
                                                {form.errors.closed_dates}
                                            </ErrorText>
                                        )}
                                        {form.data.closed_dates.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {form.data.closed_dates.map(
                                                    (date) => (
                                                        <span
                                                            key={date}
                                                            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                                                        >
                                                            {date}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeClosedDate(
                                                                        date,
                                                                    )
                                                                }
                                                                aria-label={
                                                                    'Hapus tanggal libur ' +
                                                                    date
                                                                }
                                                                className="text-slate-400 hover:text-rose-700"
                                                            >
                                                                <X size={13} />
                                                            </button>
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                        <Field
                                            label="Jadwal dibuka sampai (hari ke depan)"
                                            error={
                                                form.errors.booking_advance_days
                                            }
                                        >
                                            <input
                                                type="number"
                                                min={1}
                                                max={365}
                                                value={
                                                    form.data
                                                        .booking_advance_days
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'booking_advance_days',
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                                className={inputClass}
                                                required
                                            />
                                        </Field>
                                        <Field
                                            label="Batas ubah/batal (menit sebelum jadwal)"
                                            error={
                                                form.errors
                                                    .cancellation_cutoff_minutes
                                            }
                                        >
                                            <input
                                                type="number"
                                                min={0}
                                                max={10080}
                                                value={
                                                    form.data
                                                        .cancellation_cutoff_minutes
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'cancellation_cutoff_minutes',
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                                className={inputClass}
                                                required
                                            />
                                        </Field>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500">
                                        Isi 0 untuk mengizinkan perubahan dan
                                        pembatalan sampai waktu reservasi.
                                    </p>
                                </div>
                                <div className="space-y-3 border-t border-slate-100 pt-5">
                                    <Toggle
                                        title="Terima antrean langsung"
                                        text="Petugas dapat menambahkan walk-in dan pelanggan dapat mengambil nomor antrean."
                                        checked={form.data.queue_enabled}
                                        onChange={(value) =>
                                            form.setData('queue_enabled', value)
                                        }
                                    />
                                    <Toggle
                                        title="Terima janji temu"
                                        text="Pelanggan dapat memilih slot waktu yang masih tersedia."
                                        checked={form.data.accepts_appointments}
                                        onChange={(value) =>
                                            form.setData(
                                                'accepts_appointments',
                                                value,
                                            )
                                        }
                                    />
                                </div>
                                <button
                                    disabled={form.processing}
                                    className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-extrabold text-white hover:bg-teal-800 disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    {form.processing
                                        ? 'Menyimpan…'
                                        : 'Simpan pengaturan'}
                                </button>
                            </form>
                        </section>

                        <aside className="space-y-5">
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex items-start gap-3">
                                    <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-700">
                                        <Building2 size={18} />
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-extrabold">
                                            Tambah cabang
                                        </h2>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Cabang baru memiliki jadwal dan
                                            layanan sendiri.
                                        </p>
                                    </div>
                                </div>
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        newBranch.post('/business/branches', {
                                            preserveScroll: true,
                                        });
                                    }}
                                    className="mt-5 space-y-4"
                                >
                                    <Field
                                        label="Nama cabang"
                                        error={newBranch.errors.name}
                                    >
                                        <input
                                            value={newBranch.data.name}
                                            onChange={(e) =>
                                                newBranch.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass}
                                            placeholder="Cabang baru"
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Alamat"
                                        error={newBranch.errors.address}
                                    >
                                        <textarea
                                            value={newBranch.data.address}
                                            onChange={(e) =>
                                                newBranch.setData(
                                                    'address',
                                                    e.target.value,
                                                )
                                            }
                                            className={
                                                inputClass +
                                                ' min-h-20 resize-y'
                                            }
                                            placeholder="Alamat lengkap"
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Telepon (opsional)"
                                        error={newBranch.errors.phone}
                                    >
                                        <input
                                            value={newBranch.data.phone}
                                            onChange={(e) =>
                                                newBranch.setData(
                                                    'phone',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </Field>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field
                                            label="Buka"
                                            error={
                                                newBranch.errors.opening_time
                                            }
                                        >
                                            <input
                                                type="time"
                                                value={
                                                    newBranch.data.opening_time
                                                }
                                                onChange={(e) =>
                                                    newBranch.setData(
                                                        'opening_time',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />
                                        </Field>
                                        <Field
                                            label="Tutup"
                                            error={
                                                newBranch.errors.closing_time
                                            }
                                        >
                                            <input
                                                type="time"
                                                value={
                                                    newBranch.data.closing_time
                                                }
                                                onChange={(e) =>
                                                    newBranch.setData(
                                                        'closing_time',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />
                                        </Field>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs font-bold text-slate-500">
                                            Hari buka
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {days.map((day) => {
                                                const active =
                                                    newBranch.data.working_days.includes(
                                                        day.value,
                                                    );
                                                return (
                                                    <button
                                                        type="button"
                                                        key={day.value}
                                                        onClick={() =>
                                                            toggleNewDay(
                                                                day.value,
                                                            )
                                                        }
                                                        aria-pressed={active}
                                                        className={
                                                            'rounded-lg border px-2.5 py-2 text-[11px] font-extrabold ' +
                                                            (active
                                                                ? 'border-teal-700 bg-teal-700 text-white'
                                                                : 'border-slate-200 text-slate-500')
                                                        }
                                                    >
                                                        {day.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {newBranch.errors.working_days && (
                                            <ErrorText>
                                                {newBranch.errors.working_days}
                                            </ErrorText>
                                        )}
                                    </div>
                                    <button
                                        disabled={newBranch.processing}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-extrabold text-slate-700 hover:border-teal-300 hover:text-teal-800 disabled:opacity-50"
                                    >
                                        <Plus size={16} />
                                        {newBranch.processing
                                            ? 'Membuat cabang…'
                                            : 'Buat cabang'}
                                    </button>
                                </form>
                            </section>
                            <section className="antrein-highlight-panel p-5">
                                <p className="text-xs font-bold tracking-[.16em] text-teal-700 uppercase">
                                    Tautan pelanggan
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Tautan publik tetap menggunakan nama usaha.
                                    Pelanggan dapat memilih cabang dari halaman
                                    tersebut.
                                </p>
                                <Link
                                    href="/dashboard"
                                    className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-teal-800 hover:text-teal-950"
                                >
                                    Kembali ke ruang kerja{' '}
                                    <ArrowLeft size={15} />
                                </Link>
                            </section>
                        </aside>
                    </div>
                </div>
            </div>
        </>
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
            {error && <ErrorText>{error}</ErrorText>}
        </label>
    );
}
function ErrorText({ children }: { children?: string }) {
    return children ? (
        <span className="mt-1 block text-xs font-medium text-rose-600">
            {children}
        </span>
    ) : null;
}
function Toggle({
    title,
    text,
    checked,
    onChange,
}: {
    title: string;
    text: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3.5">
            <div>
                <p className="text-sm font-bold text-slate-800">{title}</p>
                <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                    {text}
                </p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={
                    'relative h-7 w-12 shrink-0 rounded-full transition ' +
                    (checked ? 'bg-teal-700' : 'bg-slate-300')
                }
            >
                <span
                    className={
                        'absolute top-1 size-5 rounded-full bg-white shadow transition-all ' +
                        (checked ? 'left-6' : 'left-1')
                    }
                />
            </button>
        </div>
    );
}
const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';
