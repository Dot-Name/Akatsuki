export default { content: ['./index.html', './src/**/*.{js,jsx}'], theme: { extend: {
  fontFamily: { sans: ['Roboto', 'system-ui', 'sans-serif'], display: ['Poppins', 'Roboto', 'sans-serif'] },
  colors: { ink: '#0B0B0B', paper: '#FFFFFF', brand: { DEFAULT: '#0B0B0B', dark: '#2B2B2B', soft: '#F2F2F2', red: '#C62828', orange: '#E65100', purple: '#6A1B9A' },
    paid: { DEFAULT: '#2B2B2B', soft: '#EEEEEE' }, due: { DEFAULT: '#C62828', soft: '#FDECEC' }, part: { DEFAULT: '#E65100', soft: '#FFF0E6' }, purple: { DEFAULT: '#6A1B9A', soft: '#F3E8FA' } } } }, plugins: [] };
