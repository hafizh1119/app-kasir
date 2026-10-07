import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayouts';
import RawatJalanForm from '@/Components/RawatJalan/RawatJalanForm';
import { StatusBadge } from '@/Pages/Transaksi/RawatJalan/StatusPembayaran';

export default function Create({ kunjungan, poliklinik, status }) {
  return (
    <AdminLayout title="Tambah Transaksi Rawat Jalan">
      <Head title="Tambah Transaksi Rawat Jalan" />

      <div className="mb-4">
        <StatusBadge status={status} />
      </div>

      <RawatJalanForm
        kunjungan={kunjungan}
        poliklinik={poliklinik}
        status={status}
        method="post"
        url="/rawat-jalan"
        crumb="Tambah Transaksi"
        submitLabel="Simpan Transaksi"
      />
    </AdminLayout>
  );
}