import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayouts';
import RawatJalanForm from '@/Components/RawatJalan/RawatJalanForm';

export default function Edit({ kunjungan, poliklinik }) {
  return (
    <AdminLayout title="Edit Transaksi Rawat Jalan">
      <Head title="Edit Transaksi Rawat Jalan" />
      <RawatJalanForm
        kunjungan={kunjungan}
        poliklinik={poliklinik}
        method="put"
        url={`/rawat-jalan/${kunjungan.id}`}
        crumb={`Edit Transaksi #${kunjungan.id}`}
        submitLabel="Simpan Perubahan"
      />
    </AdminLayout>
  );
}