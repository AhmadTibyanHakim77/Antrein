import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    Check,
    Clock3,
    Plus,
    Scissors,
    Settings2,
    Users,
    Wrench,
} from 'lucide-react';

type Branch = { id: number; name: string };
type Service = {
    id: number;
    name: string;
    description: string | null;
    duration_minutes: number;
    buffer_minutes: number;
    slot_capacity: number;
    allow_walk_ins: boolean;
    is_active: boolean;
};
type Props = {
    business: { name: string };
    branches: Branch[];
    branch: Branch;
    services: Service[];
    flash?: string | null;
};
type ServiceData = {
    branch_id: number;
    name: string;
    description: string;
    duration_minutes: number;
    buffer_minutes: number;
    slot_capacity: number;
    allow_walk_ins: boolean;
};

export default function ServicesIndex({
    business,
    branches,
    branch,
    services,
    flash,
}: Props) {
    const form = useForm<ServiceData>({
        branch_id: branch.id,
        name: '',
        description: '',
        duration_minutes: 30,
        buffer_minutes: 0,
        slot_capacity: 1,
        allow_walk_ins: true,
    });
    const changeBranch = (id: number) =>
        router.get('/services', { branch_id: id }, { preserveState: false });

    return (
        <>
            <Head title="Layanan — Antrein" />
            <div className="antrein-ambient min-h-screen bg-[#f6f8f8] text-slate-900">
                <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-xs font-black tracking-[.18em] text-teal-700 uppercase">
                                Pengaturan operasional
                            </p>
                            <h1 className="mt-1 text-3xl font-black tracking-tight">
                                Layanan
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Kelola durasi dan kapasitas agar jadwal
                                pelanggan tetap realistis.
                            </p>
                        </div>
                        {branches.length > 1 && (
                            <label className="text-xs font-bold text-slate-500">
                                Cabang
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
                        <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                            <Check size={16} />
                            {flash}
                        </div>
                    )}
                    <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-extrabold">
                                        Daftar layanan
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {business.name} · {branch.name}
                                    </p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                    {
                                        services.filter(
                                            (service) => service.is_active,
                                        ).length
                                    }{' '}
                                    aktif
                                </span>
                            </div>
                            {services.length === 0 ? (
                                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                                    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                                        <BriefcaseBusiness size={21} />
                                    </span>
                                    <h3 className="mt-3 text-sm font-extrabold">
                                        Tambahkan layanan pertama
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Pelanggan membutuhkan layanan aktif
                                        untuk membuat reservasi.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5 space-y-3">
                                    {services.map((service, index) => (
                                        <ServiceRow
                                            key={service.id}
                                            service={service}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-center gap-3">
                                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                                    <Plus size={18} />
                                </span>
                                <div>
                                    <h2 className="text-lg font-extrabold">
                                        Tambah layanan
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Atur durasi, jeda persiapan, dan
                                        kapasitas.
                                    </p>
                                </div>
                            </div>
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.post('/services', {
                                        preserveScroll: true,
                                        onSuccess: () =>
                                            form.reset('name', 'description'),
                                    });
                                }}
                                className="mt-5 space-y-4"
                            >
                                <label className="block text-sm font-bold text-slate-700">
                                    Nama layanan
                                    <input
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        className={inputClass}
                                        placeholder="Contoh: Potong rambut"
                                        required
                                    />
                                    {form.errors.name && (
                                        <ErrorText>
                                            {form.errors.name}
                                        </ErrorText>
                                    )}
                                </label>
                                <label className="block text-sm font-bold text-slate-700">
                                    Deskripsi (opsional)
                                    <textarea
                                        value={form.data.description}
                                        onChange={(e) =>
                                            form.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        className={
                                            inputClass + ' min-h-20 resize-y'
                                        }
                                        placeholder="Ringkasan layanan"
                                    />
                                    {form.errors.description && (
                                        <ErrorText>
                                            {form.errors.description}
                                        </ErrorText>
                                    )}
                                </label>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    <label className="block text-sm font-bold text-slate-700">
                                        Durasi
                                        <input
                                            type="number"
                                            min="5"
                                            max="240"
                                            step="5"
                                            value={form.data.duration_minutes}
                                            onChange={(e) =>
                                                form.setData(
                                                    'duration_minutes',
                                                    Number(e.target.value),
                                                )
                                            }
                                            className={inputClass}
                                            required
                                        />
                                        <span className="mt-1 block text-[11px] font-medium text-slate-400">
                                            menit layanan
                                        </span>
                                        {form.errors.duration_minutes && (
                                            <ErrorText>
                                                {form.errors.duration_minutes}
                                            </ErrorText>
                                        )}
                                    </label>
                                    <label className="block text-sm font-bold text-slate-700">
                                        Jeda
                                        <input
                                            type="number"
                                            min="0"
                                            max="120"
                                            step="5"
                                            value={form.data.buffer_minutes}
                                            onChange={(e) =>
                                                form.setData(
                                                    'buffer_minutes',
                                                    Number(e.target.value),
                                                )
                                            }
                                            className={inputClass}
                                            required
                                        />
                                        <span className="mt-1 block text-[11px] font-medium text-slate-400">
                                            menit persiapan
                                        </span>
                                        {form.errors.buffer_minutes && (
                                            <ErrorText>
                                                {form.errors.buffer_minutes}
                                            </ErrorText>
                                        )}
                                    </label>
                                    <label className="block text-sm font-bold text-slate-700">
                                        Kapasitas slot
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={form.data.slot_capacity}
                                            onChange={(e) =>
                                                form.setData(
                                                    'slot_capacity',
                                                    Number(e.target.value),
                                                )
                                            }
                                            className={inputClass}
                                            required
                                        />
                                        <span className="mt-1 block text-[11px] font-medium text-slate-400">
                                            booking bersamaan
                                        </span>
                                        {form.errors.slot_capacity && (
                                            <ErrorText>
                                                {form.errors.slot_capacity}
                                            </ErrorText>
                                        )}
                                    </label>
                                </div>
                                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                                    <input
                                        type="checkbox"
                                        checked={form.data.allow_walk_ins}
                                        onChange={(e) =>
                                            form.setData(
                                                'allow_walk_ins',
                                                e.target.checked,
                                            )
                                        }
                                        className="mt-0.5 size-4 accent-teal-700"
                                    />
                                    <span>
                                        <span className="block text-sm font-bold text-slate-700">
                                            Terima walk-in
                                        </span>
                                        <span className="mt-0.5 block text-xs text-slate-500">
                                            Pelanggan dapat mengambil nomor
                                            antrean langsung.
                                        </span>
                                    </span>
                                </label>
                                <button
                                    disabled={form.processing}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3.5 text-sm font-extrabold text-white hover:bg-teal-800 disabled:opacity-50"
                                >
                                    {form.processing
                                        ? 'Menyimpan…'
                                        : 'Tambahkan layanan'}{' '}
                                    <Plus size={16} />
                                </button>
                            </form>
                            <div className="mt-5 flex gap-3 rounded-xl border border-sky-100 bg-sky-50 p-3.5 text-xs leading-5 text-sky-900">
                                <Settings2
                                    size={16}
                                    className="mt-0.5 shrink-0"
                                />
                                <p>
                                    Jeda memberi waktu persiapan sebelum slot
                                    berikutnya. Slot mengikuti jam cabang dan
                                    kapasitas layanan.
                                </p>
                            </div>
                        </section>
                    </div>
                    <div className="antrein-highlight-panel mt-5 flex items-center justify-between gap-4 px-5 py-4">
                        <div>
                            <p className="text-sm font-extrabold">
                                Bagikan halaman pemesanan
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">
                                Pelanggan dapat memilih layanan aktif dari
                                halaman publik Anda.
                            </p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="shrink-0 rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-xs font-extrabold text-teal-800 shadow-sm transition hover:bg-teal-50"
                        >
                            Kembali ke dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

function ServiceRow({ service, index }: { service: Service; index: number }) {
    const form = useForm({
        name: service.name,
        description: service.description ?? '',
        duration_minutes: service.duration_minutes,
        buffer_minutes: service.buffer_minutes,
        slot_capacity: service.slot_capacity,
        allow_walk_ins: service.allow_walk_ins,
        is_active: service.is_active,
    });
    const Icon = index % 2 === 0 ? Scissors : Wrench;
    const toggleActive = () =>
        router.put(
            '/services/' + service.id,
            { ...form.data, is_active: !service.is_active },
            { preserveScroll: true },
        );
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                form.put('/services/' + service.id, { preserveScroll: true });
            }}
            className={
                'rounded-2xl border p-4 ' +
                (service.is_active
                    ? 'border-slate-200'
                    : 'border-slate-100 bg-slate-50/70')
            }
        >
            <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                    <Icon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-extrabold outline-none focus:border-slate-200 focus:bg-white"
                            aria-label="Nama layanan"
                        />
                        <span
                            className={
                                'rounded-full px-2 py-1 text-[10px] font-extrabold ' +
                                (service.is_active
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-slate-200 text-slate-500')
                            }
                        >
                            {service.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                    </div>
                    <input
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-slate-500 outline-none focus:border-slate-200 focus:bg-white"
                        placeholder="Deskripsi layanan"
                        aria-label="Deskripsi layanan"
                    />
                </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
                <label className="text-[11px] font-bold text-slate-500">
                    <span className="mb-1 flex items-center gap-1">
                        <Clock3 size={13} /> Durasi
                    </span>
                    <input
                        type="number"
                        min="5"
                        max="240"
                        step="5"
                        value={form.data.duration_minutes}
                        onChange={(e) =>
                            form.setData(
                                'duration_minutes',
                                Number(e.target.value),
                            )
                        }
                        className={smallInput}
                    />
                </label>
                <label className="text-[11px] font-bold text-slate-500">
                    <span className="mb-1 block">Jeda</span>
                    <input
                        type="number"
                        min="0"
                        max="120"
                        step="5"
                        value={form.data.buffer_minutes}
                        onChange={(e) =>
                            form.setData(
                                'buffer_minutes',
                                Number(e.target.value),
                            )
                        }
                        className={smallInput}
                    />
                </label>
                <label className="text-[11px] font-bold text-slate-500">
                    <span className="mb-1 flex items-center gap-1">
                        <Users size={13} /> Kapasitas
                    </span>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={form.data.slot_capacity}
                        onChange={(e) =>
                            form.setData(
                                'slot_capacity',
                                Number(e.target.value),
                            )
                        }
                        className={smallInput}
                    />
                </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <input
                        type="checkbox"
                        checked={form.data.allow_walk_ins}
                        onChange={(e) =>
                            form.setData('allow_walk_ins', e.target.checked)
                        }
                        className="size-4 accent-teal-700"
                    />{' '}
                    Menerima walk-in
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={toggleActive}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                        {service.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                        disabled={form.processing}
                        className="rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-teal-800"
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </form>
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
const smallInput =
    'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-teal-500';
