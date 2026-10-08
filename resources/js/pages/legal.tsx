import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarClock, ShieldCheck } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';

type Props = { page: 'privacy' | 'terms' };
type Section = { title: string; body: string };

const content: Record<
    Props['page'],
    { title: string; intro: string; sections: Section[] }
> = {
    privacy: {
        title: 'Kebijakan Privasi',
        intro: 'Antrein menggunakan data seperlunya untuk mengelola reservasi, antrean, akun usaha, dan keamanan layanan.',
        sections: [
            {
                title: 'Data yang digunakan',
                body: 'Pelanggan memberikan nama, nomor telepon, dan email bila memilih mengisinya. Usaha memberikan data profil, cabang, layanan, dan jam operasional. Sistem juga mencatat kode reservasi, jadwal, status antrean, serta riwayat perubahan untuk menjalankan layanan.',
            },
            {
                title: 'Tujuan penggunaan',
                body: 'Data pelanggan digunakan untuk membuat dan mengelola reservasi, menampilkan status dan estimasi antrean, serta membantu petugas melayani pelanggan. Data akun dan operasional digunakan untuk menyediakan dashboard dan menjaga keamanan akses.',
            },
            {
                title: 'Akses dan pembagian data',
                body: 'Informasi reservasi hanya tersedia bagi usaha terkait dan anggota tim yang diberi akses sesuai cabang. Antrein tidak menjual data pelanggan. Pengelola infrastruktur dapat memproses data teknis yang dibutuhkan untuk menjalankan dan melindungi aplikasi.',
            },
            {
                title: 'Penyimpanan dan keamanan',
                body: 'Data disimpan selama diperlukan untuk operasional, riwayat layanan, dan kewajiban yang berlaku. Antrein menerapkan pembatasan akses dan pencatatan aktivitas, tetapi tidak ada sistem internet yang dapat menjamin keamanan mutlak. Jangan memasukkan rekam medis atau informasi sensitif ke formulir.',
            },
            {
                title: 'Permintaan dan perubahan',
                body: 'Pelanggan dapat menghubungi usaha tempat reservasi dibuat untuk memperbaiki atau meminta penghapusan data reservasi. Pemilik usaha dapat mengelola data usaha melalui akun Antrein. Kebijakan ini dapat diperbarui saat fitur atau kewajiban operasional berubah.',
            },
        ],
    },
    terms: {
        title: 'Ketentuan Penggunaan',
        intro: 'Ketentuan ini menjelaskan penggunaan Antrein untuk membantu usaha mengatur janji temu dan antrean layanan.',
        sections: [
            {
                title: 'Fungsi Antrein',
                body: 'Antrein menyediakan alat untuk menampilkan layanan dan jadwal, menerima reservasi atau antrean langsung, serta mengelola status pelayanan. Antrein bukan marketplace dan tidak mengelola transaksi pembayaran.',
            },
            {
                title: 'Tanggung jawab usaha',
                body: 'Pemilik usaha bertanggung jawab atas keakuratan profil, alamat, layanan, jam operasional, kapasitas, aturan pembatalan, dan akses petugas. Pemilik harus menjaga kerahasiaan akun serta segera mencabut akses anggota yang tidak lagi bertugas.',
            },
            {
                title: 'Tanggung jawab pelanggan',
                body: 'Pelanggan harus memberikan kontak yang dapat digunakan, memeriksa cabang dan waktu sebelum mengirim reservasi, serta mengikuti petunjuk usaha. Tautan status reservasi bersifat pribadi dan sebaiknya tidak dibagikan kepada orang lain.',
            },
            {
                title: 'Estimasi dan ketersediaan',
                body: 'Estimasi waktu tunggu adalah kisaran yang dapat berubah karena kondisi pelayanan. Reservasi dan antrean tetap bergantung pada ketersediaan cabang serta konfirmasi dan kebijakan usaha. Pelanggan sebaiknya menghubungi usaha bila memerlukan kepastian khusus.',
            },
            {
                title: 'Batasan penggunaan',
                body: 'Jangan menggunakan Antrein untuk mengirim data palsu, mengganggu antrean, mencoba mengakses data usaha lain, atau memasukkan rekam medis dan informasi sensitif. Untuk klinik, Antrein hanya mengelola reservasi dan antrean; bukan rekam medis, diagnosis, atau resep.',
            },
            {
                title: 'Perubahan dan penghentian',
                body: 'Fitur dapat diperbaiki atau dinonaktifkan demi keamanan dan keberlangsungan layanan. Usaha bertanggung jawab menyiapkan prosedur antrean manual sementara jika terjadi gangguan internet atau aplikasi.',
            },
        ],
    },
};

export default function LegalPage({ page }: Props) {
    const document = content[page];
    return (
        <>
            <Head title={document.title + ' — Antrein'} />
            <div className="antrein-ambient min-h-screen bg-[#f6f8f8] text-slate-900">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-800"
                        >
                            <ArrowLeft size={16} /> Beranda Antrein
                        </Link>
                        <span className="flex items-center gap-2 text-sm font-black">
                            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-teal-600 to-emerald-800 text-white">
                                <AppLogoIcon className="size-5" />
                            </span>{' '}
                            ant<strong>rein</strong>
                        </span>
                    </div>
                </header>
                <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
                    <div className="flex items-start gap-4">
                        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                            {page === 'privacy' ? (
                                <ShieldCheck size={22} />
                            ) : (
                                <CalendarClock size={22} />
                            )}
                        </span>
                        <div>
                            <p className="text-xs font-black tracking-[.18em] text-teal-700 uppercase">
                                Informasi layanan
                            </p>
                            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                                {document.title}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                                {document.intro}
                            </p>
                            <p className="mt-2 text-xs text-slate-400">
                                Terakhir diperbarui: 8 Oktober 2026
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 space-y-4">
                        {document.sections.map((section, index) => (
                            <section
                                key={section.title}
                                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                            >
                                <p className="text-xs font-black tracking-wide text-teal-700 uppercase">
                                    0{index + 1}
                                </p>
                                <h2 className="mt-2 text-lg font-extrabold">
                                    {section.title}
                                </h2>
                                <p className="mt-2 text-sm leading-7 text-slate-600">
                                    {section.body}
                                </p>
                            </section>
                        ))}
                    </div>
                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                        Sebelum Antrein digunakan secara publik, pemilik layanan
                        perlu melengkapi kontak pengelola, kebijakan retensi
                        data, dan prosedur permintaan privasi sesuai operasional
                        sebenarnya.
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold text-teal-800">
                        <Link href="/privasi" className="hover:underline">
                            Kebijakan Privasi
                        </Link>
                        <Link href="/ketentuan" className="hover:underline">
                            Ketentuan Penggunaan
                        </Link>
                    </div>
                </main>
                <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} Antrein · Atur antrean,
                    tenangkan pelanggan.
                </footer>
            </div>
        </>
    );
}
