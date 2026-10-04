import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayouts';
import RawatInapForm from '@/Components/RawatInap/RawatInapForm';

export default function Create({ kunjungan, ruangan }) {
  return (
    <AdminLayout title="Tambah Transaksi Rawat Inap">
      <Head title="Tambah Transaksi Rawat Inap" />
      <RawatInapForm
        kunjungan={kunjungan}
        ruangan={ruangan}
        method="post"
        url="/rawat-inap"
        crumb="Tambah Transaksi"
        submitLabel="Simpan Transaksi"
      />
    </AdminLayout>
  );
}