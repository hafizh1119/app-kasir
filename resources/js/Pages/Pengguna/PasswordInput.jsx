import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Input password dengan tombol ikon mata.
 * Setiap pemakaian punya state "lihat" sendiri, jadi tiap field bisa dibuka/ditutup sendiri-sendiri.
 * Props lain (id, value, onChange, placeholder, autoComplete, dst.) diteruskan ke <input>.
 */
export default function PasswordInput({ inputRef, className = '', ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        {...props}
        type={show ? 'text' : 'password'}
        className={`${className} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
        title={show ? 'Sembunyikan password' : 'Tampilkan password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}