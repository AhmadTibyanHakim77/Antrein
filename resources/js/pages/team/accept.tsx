import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Clock3, ShieldCheck, Users } from 'lucide-react';

type Invitation = {
    token: string;
    email: string;
    business: string;
    branch: string;
    role: 'operator' | 'provider';
    expires_at: string;
    existing_account: boolean;
};
type Props = { invitation: Invitation };
type AcceptForm = {
    name: string;
    phone: string;
    address: string;
    password: string;
    password_confirmation: string;
    email?: string;
};

export default function AcceptInvitation({ invitation }: Props) {
    const form = useForm<AcceptForm>({
        name: '',
        phone: '',
        address: '',
        password: '',
        password_confirmation: '',
    });
    return (
        <>
            <Head title="Terima undangan tim — Antrein" />
            <main className="antrein-ambient flex min-h-screen items-center justify-center bg-[#f6f8f8] px-4 py-10 text-slate-900 sm:px-6">
                <div className="w-full max-w-xl">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-800"
                    >
                        <ArrowLeft size={16} /> Beranda Antrein
                    </Link>
                    <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
                        <div className="border-b border-teal-100 bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-6 py-7 text-slate-900 sm:px-8">
                            <span className="grid size-12 place-items-center rounded-2xl bg-teal-100 text-teal-800">
                                <Users size={22} />
                            </span>
                            <p className="mt-5 text-xs font-black tracking-[.18em] text-teal-700 uppercase">
                                Undangan tim Antrein
                            </p>
                            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                                Bergabung dengan {invitation.business}
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Anda diundang untuk membantu operasional usaha
                                melalui ruang kerja Antrein.
                            </p>
                        </div>
                        <div className="p-6 sm:p-8">
                            <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                                <Info
                                    label="Email undangan"
                                    value={invitation.email}
                                />
                                <Info
                                    label="Peran"
                                    value={
                                        invitation.role === 'operator'
                                            ? 'Operator · kelola layanan dan antrean'
                                            : 'Penyedia layanan · operasional antrean'
                                    }
                                />
                                <Info
                                    label="Akses cabang"
                                    value={invitation.branch}
                                />
                                <div className="flex items-center gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500">
                                    <Clock3 size={14} /> Berlaku hingga{' '}
                                    {invitation.expires_at}
                                </div>
                            </div>
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.post(`/undangan/${invitation.token}`, {
                                        preserveScroll: true,
                                    });
                                }}
                                className="mt-6 space-y-4"
                            >
                                {!invitation.existing_account && (
                                    <>
                                        <label className="block text-sm font-bold text-slate-700">
                                            Nama lengkap
                                            <input
                                                value={form.data.name}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'name',
                                                        event.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                                autoComplete="name"
                                                placeholder="Nama Anda"
                                                required
                                            />
                                            {form.errors.name && (
                                                <ErrorText>
                                                    {form.errors.name}
                                                </ErrorText>
                                            )}
                                        </label>
                                        <label className="block text-sm font-bold text-slate-700">
                                            Nomor WhatsApp
                                            <input
                                                type="tel"
                                                value={form.data.phone}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'phone',
                                                        event.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                                autoComplete="tel"
                                                inputMode="tel"
                                                placeholder="08xxxxxxxxxx"
                                                required
                                            />
                                            {form.errors.phone && (
                                                <ErrorText>
                                                    {form.errors.phone}
                                                </ErrorText>
                                            )}
                                        </label>
                                        <label className="block text-sm font-bold text-slate-700">
                                            Alamat (opsional)
                                            <textarea
                                                value={form.data.address}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'address',
                                                        event.target.value,
                                                    )
                                                }
                                                className={
                                                    inputClass +
                                                    ' min-h-20 resize-y'
                                                }
                                                autoComplete="street-address"
                                                placeholder="Alamat lengkap"
                                            />
                                            {form.errors.address && (
                                                <ErrorText>
                                                    {form.errors.address}
                                                </ErrorText>
                                            )}
                                        </label>
                                    </>
                                )}
                                <label className="block text-sm font-bold text-slate-700">
                                    {invitation.existing_account
                                        ? 'Kata sandi akun saat ini'
                                        : 'Kata sandi akun'}
                                    <input
                                        type="password"
                                        value={form.data.password}
                                        onChange={(event) =>
                                            form.setData(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                        className={inputClass}
                                        autoComplete={
                                            invitation.existing_account
                                                ? 'current-password'
                                                : 'new-password'
                                        }
                                        minLength={8}
                                        placeholder={
                                            invitation.existing_account
                                                ? 'Masukkan kata sandi saat ini'
                                                : 'Minimal 8 karakter'
                                        }
                                        required
                                    />
                                    {form.errors.password && (
                                        <ErrorText>
                                            {form.errors.password}
                                        </ErrorText>
                                    )}
                                </label>
                                <label className="block text-sm font-bold text-slate-700">
                                    Konfirmasi kata sandi
                                    <input
                                        type="password"
                                        value={form.data.password_confirmation}
                                        onChange={(event) =>
                                            form.setData(
                                                'password_confirmation',
                                                event.target.value,
                                            )
                                        }
                                        className={inputClass}
                                        autoComplete="new-password"
                                        minLength={8}
                                        placeholder="Ulangi kata sandi"
                                        required
                                    />
                                    {form.errors.password_confirmation && (
                                        <ErrorText>
                                            {form.errors.password_confirmation}
                                        </ErrorText>
                                    )}
                                </label>
                                <p className="text-xs leading-5 text-slate-500">
                                    Kata sandi digunakan untuk akun dengan email
                                    undangan ini. Jika Anda sudah memiliki akun,
                                    masukkan kata sandi yang sekarang.
                                </p>
                                {form.errors.email && (
                                    <p
                                        role="alert"
                                        className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                                    >
                                        {form.errors.email}
                                    </p>
                                )}
                                <button
                                    disabled={form.processing}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3.5 text-sm font-extrabold text-white hover:bg-teal-800 disabled:opacity-50"
                                >
                                    <Check size={16} />
                                    {form.processing
                                        ? 'Memproses undangan…'
                                        : 'Terima undangan'}
                                </button>
                            </form>
                            <div className="mt-5 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 p-3.5 text-xs leading-5 text-sky-900">
                                <ShieldCheck
                                    size={15}
                                    className="mt-0.5 shrink-0"
                                />
                                <p>
                                    Akses Anda dibatasi pada peran dan cabang
                                    yang ditentukan pemilik usaha.
                                </p>
                            </div>
                        </div>
                    </section>
                    <p className="mt-4 text-center text-xs text-slate-400">
                        Jika Anda tidak mengenal usaha ini, abaikan undangan dan
                        jangan masukkan kata sandi.
                    </p>
                </div>
            </main>
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                {label}
            </p>
            <p className="mt-1 text-sm font-extrabold text-slate-800">
                {value}
            </p>
        </div>
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
