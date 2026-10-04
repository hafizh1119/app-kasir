import React, { useState, useEffect, useRef } from 'react';

/**
 * Input teks dengan saran pasien. Dipakai untuk field no_rm dan nama.
 * - onChange(e): handler input biasa
 * - onPick(pasien): dipanggil saat saran diklik/dipilih ({id, no_rm, nama})
 * - enabled: false -> jadi input biasa (misal di halaman edit)
 */
export default function PasienSuggest({
  name, value, onChange, onPick, className = '', placeholder, enabled = true,
}) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef(null);
  const timer = useRef(null);
  const ctrl = useRef(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const close = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // Bersihkan timer/request saat unmount
  useEffect(() => () => {
    clearTimeout(timer.current);
    ctrl.current?.abort();
  }, []);

  const search = (text) => {
    clearTimeout(timer.current);
    ctrl.current?.abort();

    const q = text.trim();
    if (q.length < 2) {
      setItems([]);
      setOpen(false);
      return;
    }

    timer.current = setTimeout(async () => {
      ctrl.current = new AbortController();
      try {
        const res = await fetch(`/pasien/cari?q=${encodeURIComponent(q)}`, {
          headers: { Accept: 'application/json' },
          signal: ctrl.current.signal,
        });
        if (!res.ok) throw new Error('gagal');
        setItems(await res.json());
        setActive(-1);
        setOpen(true);
      } catch (e) {
        if (e.name !== 'AbortError') {
          setItems([]);
          setOpen(false);
        }
      }
    }, 250);
  };

  const handleChange = (e) => {
    onChange(e);
    if (enabled) search(e.target.value);
  };

  const pick = (p) => {
    onPick(p);
    setOpen(false);
    setItems([]);
  };

  const handleKeyDown = (e) => {
    if (!open || !items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault(); // jangan submit form
      pick(items[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={box} className="relative">
      <input
        name={name}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => items.length && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full ${className}`}
      />

      {enabled && open && (
        <ul className="absolute z-30 left-0 right-0 top-full mt-1 max-h-64 overflow-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1">
          {items.length === 0 ? (
            <li className="px-3 py-2 text-xs text-slate-400">
              Tidak ada pasien yang cocok. Akan disimpan sebagai pasien baru.
            </li>
          ) : (
            items.map((p, i) => (
              <li
                key={p.id}
                // onMouseDown supaya terpilih sebelum input kehilangan fokus
                onMouseDown={(e) => { e.preventDefault(); pick(p); }}
                onMouseEnter={() => setActive(i)}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between gap-3 ${
                  i === active ? 'bg-blue-50' : ''
                }`}
              >
                <span className="font-semibold text-slate-700">{p.no_rm}</span>
                <span className="text-slate-500 uppercase truncate">{p.nama}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}