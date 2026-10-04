import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayouts';
import IgdForm from '@/Components/Igd/IgdForm';

export default function Create({ kunjungan }) {
  return (
    <AdminLayout title="Tambah Transaksi IGD">
      <Head title="Tambah Transaksi IGD" />
      <IgdForm
        kunjungan={kunjungan}
        method="post"
        url="/igd"
        crumb="Tambah Transaksi"
        submitLabel="Simpan Transaksi"
      />
    </AdminLayout>
  );
}