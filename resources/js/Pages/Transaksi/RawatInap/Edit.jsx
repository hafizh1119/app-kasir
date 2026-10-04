import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayouts';
import RawatInapForm from '@/Components/RawatInap/RawatInapForm';

export default function Edit({ kunjungan, ruangan }) {
  return (
    <AdminLayout title="Edit Transaksi Rawat Inap">
      <Head title="Edit Transaksi Rawat Inap" />
      <RawatInapForm
        kunjungan={kunjungan}
        ruangan={ruangan}
        method="put"
        url={`/rawat-inap/${kunjungan.id}`}
        crumb={`Edit Transaksi #${kunjungan.id}`}
        submitLabel="Simpan Perubahan"
      />
    </AdminLayout>
  );
}