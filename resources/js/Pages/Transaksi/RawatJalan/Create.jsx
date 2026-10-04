import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayouts';
import RawatJalanForm from '@/Components/RawatJalan/RawatJalanForm';

export default function Create({ kunjungan, poliklinik }) {
  return (
    <AdminLayout title="Tambah Transaksi Rawat Jalan">
      <Head title="Tambah Transaksi Rawat Jalan" />
      <RawatJalanForm
        kunjungan={kunjungan}
        poliklinik={poliklinik}
        method="post"
        url="/rawat-jalan"
        crumb="Tambah Transaksi"
        submitLabel="Simpan Transaksi"
      />
    </AdminLayout>
  );
}