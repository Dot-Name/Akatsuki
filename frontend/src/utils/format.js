export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const fdate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–');
export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const mlabel = (m, y, short) => `${short ? MONTHS[m - 1].slice(0, 3) : MONTHS[m - 1]} ${y}`;
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const METHODS = [['cash', 'Cash'], ['upi', 'UPI'], ['bank_transfer', 'Bank transfer'], ['other', 'Other']];
export const methodLabel = (m) => METHODS.find((x) => x[0] === m)?.[1] || '–';
