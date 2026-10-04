import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayouts';
import IgdForm from '@/Components/Igd/IgdForm';

export default function Edit({ kunjungan }) {
  return (
    <AdminLayout title="Edit Transaksi IGD">
      <Head title="Edit Transaksi IGD" />
      <IgdForm
        kunjungan={kunjungan}
        method="put"
        url={`/igd/${kunjungan.id}`}
        crumb={`Edit Transaksi #${kunjungan.id}`}
        submitLabel="Simpan Perubahan"
      />
    </AdminLayout>
  );
}