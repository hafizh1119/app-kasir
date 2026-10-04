import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
    const page = pages[`./Pages/${name}.jsx`] || pages[`./Pages/${name}/Index.jsx`];
    return page.default || page;
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});