import { useState } from 'react';

export default function Input({ label, error, type = 'text', ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-600">{label}</label>}
      <input
        type={type}
        className={`input w-full rounded-lg border px-3 py-2 text-sm transition-colors ${
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-300' : focused ? 'border-primary focus:border-primary focus:ring-primary' : 'border-slate-300 focus:border-primary focus:ring-primary'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function TextArea({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-600">{label}</label>}
      <textarea
        className={`input w-full rounded-lg border px-3 py-2 text-sm transition-colors ${
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-300' : 'border-slate-300 focus:border-primary focus:ring-primary'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Select({ label, error, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-600">{label}</label>}
      <select
        className={`input w-full rounded-lg border px-3 py-2 text-sm transition-colors ${
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-300' : 'border-slate-300 focus:border-primary focus:ring-primary'
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-600">{label}</label>}
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function Row({ children, className = '' }) {
  return <div className={`flex gap-3 ${className}`}>{children}</div>;
}
