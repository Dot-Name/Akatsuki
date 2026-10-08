import { Link } from 'react-router-dom';

export default function BrandLogo({ className = '', imageClassName = 'h-10 w-10', nameClassName = '', showName = true }) {
  return <Link to="/" aria-label="Akatsuki home" className={`inline-flex items-center gap-3 ${className}`}>
    <span className={`relative block shrink-0 ${imageClassName}`}>
      <img src="/favicon.svg" alt="" aria-hidden="true" className="h-full w-full rounded-xl object-cover" />
    </span>
    {showName && <span className={nameClassName}>Akatsuki</span>}
  </Link>;
}
