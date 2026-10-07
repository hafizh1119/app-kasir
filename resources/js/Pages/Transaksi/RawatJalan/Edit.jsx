import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayouts';
import RawatJalanForm from '@/Components/RawatJalan/RawatJalanForm';
import { StatusBadge } from '@/Pages/Transaksi/RawatJalan/StatusPembayaran';

export default function Edit({ kunjungan, poliklinik }) {
  return (
    <AdminLayout title="Edit Transaksi Rawat Jalan">
      <Head title="Edit Transaksi Rawat Jalan" />

      <div className="mb-4">
        <StatusBadge status={kunjungan.status_pembayaran} />
      </div>

      <RawatJalanForm
        kunjungan={kunjungan}
        poliklinik={poliklinik}
        status={kunjungan.status_pembayaran}
        method="put"
        url={`/rawat-jalan/${kunjungan.id}`}
        crumb={`Edit Transaksi #${kunjungan.id}`}
        submitLabel="Simpan Perubahan"
      />
    </AdminLayout>
  );
}