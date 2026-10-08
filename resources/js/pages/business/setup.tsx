import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    Clock3,
    MapPin,
} from 'lucide-react';

type SetupForm = {
    business_name: string;
    category: string;
    business_phone: string;
    branch_name: string;
    branch_address: string;
    branch_phone: string;
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

export default function BusinessSetup() {
    const form = useForm<SetupForm>({
        business_name: '',
        category: 'clinic',
        business_phone: '',
        branch_name: '',
        branch_address: '',
        branch_phone: '',
        opening_time: '09:00',
        closing_time: '17:00',
        working_days: [1, 2, 3, 4, 5, 6],
    });

    const toggleDay = (day: number) => {
        const next = form.data.working_days.includes(day)
            ? form.data.working_days.filter((value) => value !== day)
            : [...form.data.working_days, day].sort(
                  (left, right) => left - right,
              );
        form.setData('working_days', next);
    };

    return (
        <>
            <Head title="Siapkan usaha — Antrein" />
            <main className="antrein-ambient min-h-screen bg-[#f7faf9] px-4 py-8 sm:px-6 sm:py-12">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-800"
                    >
                        <ArrowLeft size={16} /> Kembali ke beranda
                    </Link>
                    <div className="mt-7 flex items-start gap-4">
                        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-700 text-white">
                            <Building2 size={22} />
                        </span>
                        <div>
                            <p className="text-xs font-black tracking-[0.18em] text-teal-700 uppercase">
                                Langkah 1 dari 1
                            </p>
                            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                                Buat ruang usaha Anda
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                                Informasi ini membentuk halaman pemesanan publik
                                dan pengaturan antrean awal.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post('/setup');
                        }}
                        className="mt-8 space-y-6"
                    >
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-6">
                                <p className="text-xs font-black tracking-[0.16em] text-slate-400 uppercase">
                                    Profil usaha
                                </p>
                                <h2 className="mt-1 text-lg font-extrabold">
                                    Ceritakan tentang usaha Anda
                                </h2>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
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
                                        placeholder="Contoh: Klinik Sehat Sentosa"
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
                                    label="Nomor telepon usaha (opsional)"
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
                                        placeholder="08xxxxxxxxxx"
                                        className={inputClass}
                                    />
                                </Field>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-700">
                                    <MapPin size={19} />
                                </span>
                                <div>
                                    <p className="text-xs font-black tracking-[0.16em] text-slate-400 uppercase">
                                        Cabang pertama
                                    </p>
                                    <h2 className="text-lg font-extrabold">
                                        Lokasi dan jam operasional
                                    </h2>
                                </div>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
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
                                        placeholder="Contoh: Cabang Menteng"
                                        className={inputClass}
                                        required
                                    />
                                </Field>
                                <Field
                                    label="Nomor telepon cabang (opsional)"
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
                                        placeholder="08xxxxxxxxxx"
                                        className={inputClass}
                                    />
                                </Field>
                                <div className="sm:col-span-2">
                                    <Field
                                        label="Alamat lengkap"
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
                                            placeholder="Jalan, nomor, kecamatan, kota"
                                            className={
                                                inputClass +
                                                ' min-h-24 resize-y'
                                            }
                                            required
                                        />
                                    </Field>
                                </div>
                            </div>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
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
                            <div className="mt-5">
                                <p className="mb-2 text-sm font-bold text-slate-700">
                                    Hari operasional
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
                                                    'inline-flex min-w-14 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition ' +
                                                    (active
                                                        ? 'border-teal-700 bg-teal-700 text-white'
                                                        : 'border-slate-200 bg-white text-slate-500 hover:border-teal-300')
                                                }
                                            >
                                                {active && <Check size={14} />}{' '}
                                                {day.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {form.errors.working_days && (
                                    <p className="mt-2 text-xs font-medium text-rose-600">
                                        {form.errors.working_days}
                                    </p>
                                )}
                            </div>
                        </section>

                        <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                            <p className="flex items-center gap-2 text-xs leading-5 text-slate-500">
                                <Clock3 size={15} className="shrink-0" /> Zona
                                waktu cabang disetel ke WIB. Bisa disesuaikan
                                nanti.
                            </p>
                            <button
                                disabled={
                                    form.processing ||
                                    form.data.working_days.length === 0
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-teal-900/10 hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Menyimpan…'
                                    : 'Simpan dan lanjut'}{' '}
                                <ArrowRight size={16} />
                            </button>
                        </div>
                        {form.hasErrors && (
                            <p
                                role="alert"
                                className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                            >
                                Periksa kembali kolom yang ditandai.
                            </p>
                        )}
                    </form>
                </div>
            </main>
        </>
    );
}

const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';

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
                <span className="mt-1.5 block text-xs font-medium text-rose-600">
                    {error}
                </span>
            )}
        </label>
    );
}
