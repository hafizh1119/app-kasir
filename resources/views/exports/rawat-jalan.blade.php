<table>
    <thead>
        <tr>
            <th colspan="23" style="text-align: center; font-weight: bold; font-size: 14px;">
                LAPORAN TRANSAKSI RAWAT JALAN
            </th>
        </tr>
        <tr>
            <th rowspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">NO</th>
            <th rowspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">TANGGAL</th>
            <th rowspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">NO RM</th>
            <th rowspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">NAMA</th>
            <th rowspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">SHIFT</th>
            <th rowspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">JASA SARANA</th>
            <th colspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">PX DOKTER</th>
            <th colspan="7" style="border: 1px solid #000; font-weight: bold; text-align: center;">TINDAKAN</th>
            <th colspan="3" style="border: 1px solid #000; font-weight: bold; text-align: center;">PENUNJANG</th>
            <th rowspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">O2</th>
            <th rowspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">IPJ</th>
            <th rowspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">AMBLN</th>
            <th rowspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">AKOMODASI</th>
            <th rowspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">OBAT</th>
            <th rowspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">JUMLAH</th>
        </tr>
        <tr>
            <th style="border: 1px solid #000; font-weight: bold; text-align: center;">UMUM</th>
            <th style="border: 1px solid #000; font-weight: bold; text-align: center;">SPESIALIS</th>
            <th style="border: 1px solid #000; font-weight: bold; text-align: center;">KONSUL</th>
            <th style="border: 1px solid #000; font-weight: bold; text-align: center;">ASKEP</th>
            <th style="border: 1px solid #000; font-weight: bold; text-align: center;">PNM</th>
            <th style="border: 1px solid #000; font-weight: bold; text-align: center;">TMNO</th>
            <th style="border: 1px solid #000; font-weight: bold; text-align: center;">KEP</th>
            <th style="border: 1px solid #000; font-weight: bold; text-align: center;">TMO</th>
            <th style="border: 1px solid #000; font-weight: bold; text-align: center;">PERSAL</th>
            <th style="border: 1px solid #000; font-weight: bold; text-align: center;">LAB</th>
            <th style="border: 1px solid #000; font-weight: bold; text-align: center;">RO</th>
            <th style="border: 1px solid #000; font-weight: bold; text-align: center;">USG</th>
        </tr>
    </thead>
    <tbody>
        @php
            $totals = [
                'jasa_sarana' => 0, 'umum' => 0, 'spesialis' => 0, 'konsul' => 0, 'askep' => 0, 'pnm' => 0,
                'tmno' => 0, 'kep' => 0, 'tmo' => 0, 'persal' => 0, 'lab' => 0, 'ro' => 0, 'usg' => 0,
                'o2' => 0, 'ipj' => 0, 'ambln' => 0, 'akomodasi' => 0, 'obat' => 0, 'jumlah' => 0
            ];
        @endphp

        @foreach($transaksi as $index => $row)
            @php
                $totals['jasa_sarana'] += $row->jasa_sarana;
                $totals['umum'] += $row->umum;
                $totals['spesialis'] += $row->spesialis;
                $totals['konsul'] += $row->konsul;
                $totals['askep'] += $row->askep;
                $totals['pnm'] += $row->pnm;
                $totals['tmno'] += $row->tmno;
                $totals['kep'] += $row->kep;
                $totals['tmo'] += $row->tmo;
                $totals['persal'] += $row->persal;
                $totals['lab'] += $row->lab;
                $totals['ro'] += $row->ro;
                $totals['usg'] += $row->usg;
                $totals['o2'] += $row->o2;
                $totals['ipj'] += $row->ipj;
                $totals['ambln'] += $row->ambln;
                $totals['akomodasi'] += $row->akomodasi;
                $totals['obat'] += $row->obat;
                $totals['jumlah'] += $row->jumlah;
            @endphp
            <tr>
                <td style="border: 1px solid #000; text-align: center;">{{ $index + 1 }}</td>
                <td style="border: 1px solid #000;">{{ $row->tanggal->format('d/m/Y') }}</td>
                <td style="border: 1px solid #000;">{{ $row->no_rm }}</td>
                <td style="border: 1px solid #000;">{{ $row->nama }}</td>
                <td style="border: 1px solid #000; text-align: center;">{{ $row->shift }}</td>
                <td style="border: 1px solid #000;">{{ $row->jasa_sarana }}</td>
                <td style="border: 1px solid #000;">{{ $row->umum }}</td>
                <td style="border: 1px solid #000;">{{ $row->spesialis }}</td>
                <td style="border: 1px solid #000;">{{ $row->konsul }}</td>
                <td style="border: 1px solid #000;">{{ $row->askep }}</td>
                <td style="border: 1px solid #000;">{{ $row->pnm }}</td>
                <td style="border: 1px solid #000;">{{ $row->tmno }}</td>
                <td style="border: 1px solid #000;">{{ $row->kep }}</td>
                <td style="border: 1px solid #000;">{{ $row->tmo }}</td>
                <td style="border: 1px solid #000;">{{ $row->persal }}</td>
                <td style="border: 1px solid #000;">{{ $row->lab }}</td>
                <td style="border: 1px solid #000;">{{ $row->ro }}</td>
                <td style="border: 1px solid #000;">{{ $row->usg }}</td>
                <td style="border: 1px solid #000;">{{ $row->o2 }}</td>
                <td style="border: 1px solid #000;">{{ $row->ipj }}</td>
                <td style="border: 1px solid #000;">{{ $row->ambln }}</td>
                <td style="border: 1px solid #000;">{{ $row->akomodasi }}</td>
                <td style="border: 1px solid #000;">{{ $row->obat }}</td>
                <td style="border: 1px solid #000; font-weight: bold;">{{ $row->jumlah }}</td>
            </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <th colspan="5" style="border: 1px solid #000; text-align: right; font-weight: bold;">TOTAL</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['jasa_sarana'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['umum'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['spesialis'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['konsul'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['askep'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['pnm'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['tmno'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['kep'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['tmo'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['persal'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['lab'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['ro'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['usg'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['o2'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['ipj'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['ambln'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['akomodasi'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['obat'] }}</th>
            <th style="border: 1px solid #000; font-weight: bold;">{{ $totals['jumlah'] }}</th>
        </tr>
    </tfoot>
</table>
