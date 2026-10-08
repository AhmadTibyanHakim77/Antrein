import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Check,
    Clipboard,
    MailPlus,
    ShieldCheck,
    Trash2,
    UserRound,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

type Branch = { id: number; name: string };
type Member = {
    id: number;
    name: string;
    email: string;
    role: 'operator' | 'provider';
    branch: string;
    branch_id: number | null;
    service_ids: number[];
    joined_at: string;
};
type ServiceOption = { id: number; branch_id: number; name: string };
type Invitation = {
    id: number;
    email: string;
    role: 'operator' | 'provider';
    branch: string;
    expires_at: string;
};
type Props = {
    business: { name: string };
    branches: Branch[];
    services: ServiceOption[];
    members: Member[];
    invitations: Invitation[];
    flash?: string | null;
    invite_url?: string | null;
};
type InviteForm = {
    email: string;
    role: 'operator' | 'provider';
    branch_id: number | '';
};

export default function TeamIndex({
    business,
    branches,
    services,
    members,
    invitations,
    flash,
    invite_url,
}: Props) {
    const form = useForm<InviteForm>({
        email: '',
        role: 'operator',
        branch_id: '',
    });
    const [copied, setCopied] = useState(false);
    const copyInvitation = async () => {
        if (!invite_url) return;
        try {
            await navigator.clipboard.writeText(invite_url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            window.prompt('Salin tautan undangan ini:', invite_url);
        }
    };
    const revokeInvitation = (item: Invitation) => {
        if (window.confirm(`Batalkan undangan untuk ${item.email}?`))
            router.delete(`/team/invitations/${item.id}`, {
                preserveScroll: true,
            });
    };
    const removeMember = (item: Member) => {
        if (
            window.confirm(
                `Cabut akses ${item.name} (${item.email}) dari usaha ini?`,
            )
        )
            router.delete(`/team/members/${item.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Tim usaha — Antrein" />
            <div className="antrein-ambient min-h-screen bg-[#f6f8f8] text-slate-900">
                <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-xs font-black tracking-[.18em] text-teal-700 uppercase">
                                Akses dan peran
                            </p>
                            <h1 className="mt-1 text-3xl font-black tracking-tight">
                                Tim usaha
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Undang petugas dan atur cabang yang dapat mereka
                                kelola di {business.name}.
                            </p>
                        </div>
                        <Link
                            href="/business/settings"
                            className="text-sm font-extrabold text-teal-800 hover:underline"
                        >
                            Pengaturan usaha
                        </Link>
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
                    <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                                        <Users size={19} />
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-extrabold">
                                            Anggota aktif
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Pemilik usaha tetap memiliki kendali
                                            penuh.
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                    {members.length} petugas
                                </span>
                            </div>
                            {members.length === 0 ? (
                                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                                    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                                        <UserRound size={21} />
                                    </span>
                                    <h3 className="mt-3 text-sm font-extrabold">
                                        Belum ada petugas
                                    </h3>
                                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                                        Buat undangan di samping untuk memberi
                                        anggota tim akses operasional.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5 divide-y divide-slate-100">
                                    {members.map((member) => (
                                        <MemberRow
                                            key={member.id}
                                            member={member}
                                            services={services.filter(
                                                (service) =>
                                                    member.branch_id === null ||
                                                    service.branch_id ===
                                                        member.branch_id,
                                            )}
                                            onRemove={() =>
                                                removeMember(member)
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                        <aside className="space-y-5">
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex items-center gap-3">
                                    <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                                        <MailPlus size={18} />
                                    </span>
                                    <div>
                                        <h2 className="text-lg font-extrabold">
                                            Undang petugas
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Tautan berlaku selama 7 hari.
                                        </p>
                                    </div>
                                </div>
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        form.transform((data) => ({
                                            ...data,
                                            branch_id:
                                                data.branch_id === ''
                                                    ? ''
                                                    : Number(data.branch_id),
                                        }));
                                        form.post('/team/invitations', {
                                            preserveScroll: true,
                                            onSuccess: () =>
                                                form.reset('email'),
                                        });
                                    }}
                                    className="mt-5 space-y-4"
                                >
                                    <Field
                                        label="Email petugas"
                                        error={form.errors.email}
                                    >
                                        <input
                                            type="email"
                                            value={form.data.email}
                                            onChange={(event) =>
                                                form.setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                            placeholder="nama@email.com"
                                            autoComplete="email"
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Peran"
                                        error={form.errors.role}
                                    >
                                        <select
                                            value={form.data.role}
                                            onChange={(event) =>
                                                form.setData(
                                                    'role',
                                                    event.target
                                                        .value as InviteForm['role'],
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option value="operator">
                                                Operator · kelola layanan dan
                                                antrean
                                            </option>
                                            <option value="provider">
                                                Penyedia layanan · operasional
                                                antrean
                                            </option>
                                        </select>
                                    </Field>
                                    <Field
                                        label="Akses cabang"
                                        error={form.errors.branch_id}
                                    >
                                        <select
                                            value={form.data.branch_id}
                                            onChange={(event) =>
                                                form.setData(
                                                    'branch_id',
                                                    event.target.value
                                                        ? Number(
                                                              event.target
                                                                  .value,
                                                          )
                                                        : '',
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Semua cabang
                                            </option>
                                            {branches.map((branch) => (
                                                <option
                                                    key={branch.id}
                                                    value={branch.id}
                                                >
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <div className="rounded-xl bg-sky-50 p-3 text-xs leading-5 text-sky-900">
                                        <ShieldCheck
                                            size={15}
                                            className="mr-1 inline"
                                        />
                                        Operator dapat mengelola layanan dan
                                        antrean. Penyedia layanan dapat
                                        menangani antrean di cabang yang
                                        ditugaskan.
                                    </div>
                                    {Object.values(form.errors).length > 0 && (
                                        <p
                                            role="alert"
                                            className="text-xs font-semibold text-rose-600"
                                        >
                                            {Object.values(form.errors)[0]}
                                        </p>
                                    )}
                                    <button
                                        disabled={form.processing}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3.5 text-sm font-extrabold text-white hover:bg-teal-800 disabled:opacity-50"
                                    >
                                        <MailPlus size={16} />
                                        {form.processing
                                            ? 'Membuat undangan…'
                                            : 'Buat tautan undangan'}
                                    </button>
                                </form>
                                {invite_url && (
                                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                        <p className="text-xs font-extrabold text-emerald-900">
                                            Undangan siap dibagikan
                                        </p>
                                        <p className="mt-1 text-xs break-all text-emerald-800">
                                            {invite_url}
                                        </p>
                                        <button
                                            onClick={copyInvitation}
                                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-emerald-900 shadow-sm hover:bg-emerald-100"
                                        >
                                            <Clipboard size={14} />
                                            {copied
                                                ? 'Tautan tersalin'
                                                : 'Salin tautan'}
                                        </button>
                                    </div>
                                )}
                            </section>
                        </aside>
                    </div>
                    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-extrabold">
                                    Undangan menunggu
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Undangan yang belum diterima akan
                                    kedaluwarsa setelah 7 hari.
                                </p>
                            </div>
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                                {invitations.length} aktif
                            </span>
                        </div>
                        {invitations.length === 0 ? (
                            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                                Belum ada undangan yang menunggu.
                            </p>
                        ) : (
                            <div className="mt-4 divide-y divide-slate-100">
                                {invitations.map((invitation) => (
                                    <div
                                        key={invitation.id}
                                        className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <p className="text-sm font-extrabold">
                                                {invitation.email}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {roleLabel(invitation.role)} ·{' '}
                                                {invitation.branch} · berlaku
                                                hingga {invitation.expires_at}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                revokeInvitation(invitation)
                                            }
                                            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                        >
                                            <X size={14} /> Batalkan
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                    <p className="mt-5 text-center text-xs leading-5 text-slate-400">
                        Untuk saat ini, tautan undangan dibagikan secara manual.
                        Pengiriman email otomatis memerlukan konfigurasi layanan
                        email.
                    </p>
                </div>
            </div>
        </>
    );
}

function MemberRow({
    member,
    services,
    onRemove,
}: {
    member: Member;
    services: ServiceOption[];
    onRemove: () => void;
}) {
    const form = useForm<{ service_ids: number[] }>({
        service_ids: member.service_ids,
    });
    const toggleService = (id: number) =>
        form.setData(
            'service_ids',
            form.data.service_ids.includes(id)
                ? form.data.service_ids.filter((serviceId) => serviceId !== id)
                : [...form.data.service_ids, id],
        );
    return (
        <article className="py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-black text-slate-600">
                        {member.name
                            .split(' ')
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join('')
                            .toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold">
                            {member.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                            {member.email} · {member.branch}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <RolePill role={member.role} />
                    <button
                        onClick={onRemove}
                        className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                        aria-label={`Cabut akses ${member.name}`}
                        title="Cabut akses"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>
            {member.role === 'provider' && (
                <details className="mt-3 rounded-xl bg-slate-50 p-3">
                    <summary className="cursor-pointer text-xs font-extrabold text-teal-800">
                        Atur layanan · {member.service_ids.length} ditugaskan
                    </summary>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.put(`/team/members/${member.id}/services`, {
                                preserveScroll: true,
                            });
                        }}
                        className="mt-3"
                    >
                        <div className="grid gap-2 sm:grid-cols-2">
                            {services.length === 0 ? (
                                <p className="text-xs text-slate-500">
                                    Belum ada layanan aktif di cakupan cabang
                                    petugas ini.
                                </p>
                            ) : (
                                services.map((service) => (
                                    <label
                                        key={service.id}
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-700"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.data.service_ids.includes(
                                                service.id,
                                            )}
                                            onChange={() =>
                                                toggleService(service.id)
                                            }
                                            className="size-4 rounded border-slate-300 accent-teal-700"
                                        />
                                        {service.name}
                                    </label>
                                ))
                            )}
                        </div>
                        {form.errors.service_ids && (
                            <p className="mt-2 text-xs text-rose-600">
                                {form.errors.service_ids}
                            </p>
                        )}
                        <button
                            disabled={form.processing || services.length === 0}
                            className="mt-3 rounded-lg bg-teal-700 px-3 py-2 text-xs font-extrabold text-white hover:bg-teal-800 disabled:opacity-50"
                        >
                            {form.processing
                                ? 'Menyimpan…'
                                : 'Simpan penugasan'}
                        </button>
                    </form>
                </details>
            )}
        </article>
    );
}

function RolePill({ role }: { role: 'operator' | 'provider' }) {
    return (
        <span
            className={
                'rounded-full px-2.5 py-1 text-[10px] font-extrabold ' +
                (role === 'operator'
                    ? 'bg-teal-50 text-teal-800'
                    : 'bg-violet-50 text-violet-800')
            }
        >
            {roleLabel(role)}
        </span>
    );
}
function roleLabel(role: 'operator' | 'provider') {
    return role === 'operator' ? 'Operator' : 'Penyedia layanan';
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
