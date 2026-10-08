import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import Icon from '../components/Icon';
import ReviewsMarquee from '../components/ReviewsMarquee';
import OrbitalLearningSystem from '../components/OrbitalLearningSystem';

const address = 'F - 173, F - Block, Mangol Puri, New Delhi';
const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '918826297238').replace(/\D/g, '');
const whatsapp = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Akatsuki, I would like to know more.')}`;
const communityWhatsapp = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'd like to know more about joining Akatsuki.")}`;
const nav = [['About', '#about'], ['Teachers', '#teachers'], ['Students', '#students'], ['Reviews', '#reviews'], ['Contact', '#contact']];

function SectionLabel({ children, inverse = false }) { return <p className={`text-xs font-bold uppercase tracking-[0.16em] ${inverse ? 'text-[#C62828]' : 'text-brand'}`}>{children}</p>; }

export default function PublicHome() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const orbitalRef = useRef(null);
  const adminHref = user ? '/dashboard' : '/login';
  const moveOrbits = (event) => {
    if (event.pointerType !== 'mouse' || !orbitalRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) / bounds.width;
    const y = (event.clientY - bounds.top - bounds.height / 2) / bounds.height;
    orbitalRef.current.style.setProperty('--parallax-back-x', `${x * 3}px`);
    orbitalRef.current.style.setProperty('--parallax-back-y', `${y * 3}px`);
    orbitalRef.current.style.setProperty('--parallax-mid-x', `${x * 7}px`);
    orbitalRef.current.style.setProperty('--parallax-mid-y', `${y * 7}px`);
    orbitalRef.current.style.setProperty('--parallax-front-x', `${x * 11}px`);
    orbitalRef.current.style.setProperty('--parallax-front-y', `${y * 11}px`);
  };
  const resetOrbits = () => {
    if (!orbitalRef.current) return;
    ['back', 'mid', 'front'].forEach((layer) => {
      orbitalRef.current.style.setProperty(`--parallax-${layer}-x`, '0px');
      orbitalRef.current.style.setProperty(`--parallax-${layer}-y`, '0px');
    });
  };

  return <div className="min-h-screen overflow-hidden bg-white text-slate-800">
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 shadow-[0_4px_20px_rgba(11,11,11,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-[#111111]/95 dark:shadow-black/20">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo nameClassName="text-sm font-bold tracking-tight sm:text-base" />
        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/80 p-1 md:flex dark:border-slate-700 dark:bg-slate-900/60" aria-label="Main navigation">{nav.map(([label, href]) => <a key={href} href={href} className="rounded-full px-3 py-2 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-white hover:text-[#C62828] hover:shadow-sm focus-visible:bg-white dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">{label}</a>)}</nav>
        <div className="hidden items-center gap-2.5 md:flex"><Link to={adminHref} className="btn-primary !min-h-10 !rounded-xl !px-4 !py-2">{user ? 'Open dashboard' : 'Admin sign in'}<Icon name="arrowRight" /></Link></div>
        <div className="flex items-center gap-2 md:hidden"><button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}><Icon name={menuOpen ? 'close' : 'menu'} /></button></div>
      </div>
      {menuOpen && <nav className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-slate-100 bg-white px-4 py-3 shadow-lg dark:border-slate-800 dark:bg-[#111111] md:hidden" aria-label="Mobile navigation"><div className="mx-auto flex max-w-7xl flex-col gap-1">{nav.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">{label}</a>)}<Link to={adminHref} onClick={() => setMenuOpen(false)} className="mt-1 rounded-lg bg-brand px-3 py-2.5 text-sm font-semibold text-white">{user ? 'Open dashboard' : 'Admin sign in'}</Link></div></nav>}
    </header>
    <div aria-hidden="true" className="h-[72px]" />

    <main id="top">
      <section ref={orbitalRef} data-reveal onPointerMove={moveOrbits} onPointerLeave={resetOrbits} className="hero-section relative isolate overflow-hidden bg-[#0B0B0B]">
        <OrbitalLearningSystem />
        <div className="relative z-10 mx-auto grid min-h-[590px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl"><span className="hero-enter hero-enter-one inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-white/80 shadow-sm"><span className="h-2 w-2 rounded-full bg-[#C62828]"/>MANGOL PURI · NEW DELHI</span>
            <h1 className="hero-enter hero-enter-two mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[60px]">A place to learn,<br className="hidden sm:block"/> grow and feel <span className="text-brand-red">supported.</span></h1>
            <p className="hero-enter hero-enter-three mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">At Akatsuki, Manish and Tanisha help learners build strong foundations, ask questions with confidence and make steady progress. Visit us in Mangol Puri, New Delhi.</p>
            <div className="hero-enter hero-enter-four mt-8 flex flex-wrap gap-3"><a href="#teachers" className="btn-primary !px-5 !py-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">Meet the teachers <Icon name="arrowRight" /></a><a href={directions} target="_blank" rel="noreferrer" className="btn-ghost !px-5 !py-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-md">Find us</a></div>
            <div className="mt-9 flex items-center gap-3 border-t border-slate-200 pt-5"><div className="flex -space-x-2"><img src="https://res.cloudinary.com/dr0cgvrva/image/upload/v1791445602/1_paq3dk.jpg" alt="Manish" loading="lazy" className="h-9 w-9 rounded-full border-2 border-[#F5F5F5] object-cover"/><img src="https://res.cloudinary.com/dr0cgvrva/image/upload/v1791445603/2_optt1n.jpg" alt="Tanisha" loading="lazy" className="h-9 w-9 rounded-full border-2 border-[#F5F5F5] object-cover"/></div><p className="text-sm text-slate-500"><span className="font-semibold text-slate-700">Manish & Tanisha</span><br/>Your teachers at Akatsuki</p></div>
          </div>
          <div className="relative mx-auto w-full max-w-[510px]">
            <div className="absolute -left-4 top-12 h-24 w-24 rounded-[28px] bg-[#ECECEC] sm:-left-7"/><div className="absolute -right-4 bottom-7 h-28 w-28 rounded-full bg-[#FFF0E6] sm:-right-8"/>
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#111111]/95 p-6 text-white shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10"/><div className="absolute -right-5 -top-5 h-36 w-36 rounded-full border border-white/10"/>
              <div className="relative flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C62828]">Akatsuki</p><h2 className="mt-3 max-w-xs text-2xl font-bold leading-snug sm:text-3xl">Every learner deserves room to grow.</h2></div><img src="/favicon.svg" alt="Akatsuki emblem" className="h-12 w-12 rounded-2xl"/></div>
              <div className="relative mt-9 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><span className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#C62828]/20 text-white"><Icon name="sparkles" /></span><p className="text-sm font-semibold">Steady guidance</p><p className="mt-1 text-xs leading-5 text-white/70">Learn with support at every step.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><span className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#E65100]/20 text-[#FF8A45]"><Icon name="arrowUpRight" /></span><p className="text-sm font-semibold">Room to progress</p><p className="mt-1 text-xs leading-5 text-white/70">Build confidence through practice.</p></div></div>
              <p className="relative mt-7 border-t border-white/10 pt-4 text-xs text-white/50">A welcoming learning space in Mangol Puri, New Delhi</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" data-reveal className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><div><SectionLabel>About Akatsuki</SectionLabel><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">A supportive place to learn, practice and grow.</h2></div><div className="max-w-2xl"><p className="text-base leading-7 text-slate-600">Every learner develops at their own pace. Our focus is on clear explanations, regular practice and the encouragement to keep going when a topic feels challenging. Akatsuki is a neighborhood learning space led by Manish and Tanisha in Mangol Puri.</p><a href="#contact" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:gap-3 hover:underline">Visit Akatsuki <Icon name="arrowRight" /></a></div></div>
      </section>

      <section id="teachers" data-reveal className="scroll-mt-24 bg-[#F5F5F5] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-2xl text-center"><SectionLabel>Meet your teachers</SectionLabel><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Teach. Inspire. Transform.</h2><p className="mt-4 text-base leading-7 text-slate-600">Manish and Tanisha bring patience, care and a love of learning to every lesson.</p></div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">{[
            ['Manish', 'https://res.cloudinary.com/dr0cgvrva/image/upload/v1791445602/1_paq3dk.jpg', 'Simplifying difficult concepts and building strong fundamentals that help students learn with confidence.'],
            ['Tanisha', 'https://res.cloudinary.com/dr0cgvrva/image/upload/v1791445603/2_optt1n.jpg', 'Helping students learn comfortably, improve consistently, and turn their potential into meaningful results.'],
          ].map(([name, image, description]) => <article key={name} className="teacher-card overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"><div className="teacher-image-stage mx-3 mt-3 rounded-xl" style={{ '--teacher-image': `url("${image}")` }}><img src={image} alt={`${name}, teacher at Akatsuki`} loading="lazy" className="teacher-main-image h-64 w-full rounded-xl bg-[#2B2B2B] object-cover object-center sm:h-72"/></div><div className="p-6"><h3 className="text-lg font-bold text-slate-900">{name}</h3><p className="mt-1 text-sm font-medium text-brand-red">Teacher · Akatsuki</p><p className="mt-4 text-sm leading-6 text-slate-600">{description}</p></div></article>)}</div>
        </div>
      </section>

      <section id="students" data-reveal className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-start gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
          <div><SectionLabel>Our students</SectionLabel><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">We learn better, together.</h2></div>
          <div><p className="text-base leading-7 text-slate-600">Teachers offer direction, while students carry ideas further by explaining concepts, sharing notes and comparing perspectives. Seniors help juniors, and peers encourage one another through hard moments and academic or career choices. Along the way, everyone practices patience, communication, kindness and confidence—without treating another person’s success as competition.</p><a href={communityWhatsapp} target="_blank" rel="noreferrer" className="btn-primary mt-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">Talk to us on WhatsApp <Icon name="arrowUpRight" /></a></div>
        </div>
        <div className="mt-12 rounded-3xl bg-[#0B0B0B] p-6 text-white sm:p-8 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#C62828]">How we learn together</p>
          <div className="mt-3 grid gap-6 md:grid-cols-[1fr_auto] md:items-center"><div><h3 className="text-2xl font-bold tracking-tight sm:text-3xl">Knowledge moves in every direction.</h3><p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Different backgrounds. Different strengths. One community. Every person brings something worth sharing.</p></div><div className="grid gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-2 md:min-w-[330px]" role="img" aria-label="Knowledge shared through teacher guidance, peer exchange, and seniors helping juniors"><div className="col-span-full mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Ways knowledge is shared</div><div className="flex items-center gap-2"><span className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-2 text-center text-xs font-semibold">Teacher</span><Icon name="arrowRight" className="h-4 w-4 shrink-0 text-[#F05A5A]"/><span className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-2 text-center text-xs font-semibold">Student</span></div><div className="flex items-center gap-1.5"><span className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.06] px-2 py-2 text-center text-xs font-semibold">Student</span><Icon name="arrowRight" className="h-4 w-4 shrink-0 text-[#F05A5A]"/><Icon name="arrowRight" className="h-4 w-4 shrink-0 rotate-180 text-[#F05A5A]"/><span className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.06] px-2 py-2 text-center text-xs font-semibold">Student</span></div><div className="col-span-full flex items-center gap-2 sm:col-span-2"><span className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-2 text-center text-xs font-semibold">Senior</span><Icon name="arrowRight" className="h-4 w-4 shrink-0 text-[#F05A5A]"/><span className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-2 text-center text-xs font-semibold">Junior</span><span className="text-[10px] font-medium text-white/45">experience shared</span></div></div></div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg sm:p-6"><span className="text-xs font-bold tracking-[0.14em] text-brand-red">01</span><h3 className="mt-3 text-lg font-bold text-slate-900">Learn from one another</h3><p className="mt-2 text-sm leading-6 text-slate-600">Students explain tricky ideas, exchange notes and resources, and help each other see a subject from a new angle.</p></article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg sm:p-6"><span className="text-xs font-bold tracking-[0.14em] text-brand-red">02</span><h3 className="mt-3 text-lg font-bold text-slate-900">Build more than knowledge</h3><p className="mt-2 text-sm leading-6 text-slate-600">Everyday conversation and shared work make room for patience, discipline, kindness, confidence and clearer choices about study and careers.</p></article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg sm:p-6"><span className="text-xs font-bold tracking-[0.14em] text-brand-red">03</span><h3 className="mt-3 text-lg font-bold text-slate-900">Lift someone else up</h3><p className="mt-2 text-sm leading-6 text-slate-600">Seniors make the first step easier for juniors, and classmates stay beside anyone who is finding things tough. One person’s success leaves room for another’s.</p></article>
        </div>
      </section>

      <section id="reviews" data-reveal className="scroll-mt-24 bg-[#F5F5F5] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-0 text-center sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl px-4"><SectionLabel>Family feedback</SectionLabel><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Good learning grows through trust.</h2><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">Real family reviews will appear here when they choose to share them. We value honest feedback and protect every learner’s privacy.</p></div><div className="mt-10"><ReviewsMarquee /></div></div>
      </section>

      <section id="contact" data-reveal className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="overflow-hidden rounded-[28px] bg-[#0B0B0B] text-white"><div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12"><div><SectionLabel inverse>Find us</SectionLabel><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Come say hello.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/75">Akatsuki is in Mangol Puri, New Delhi. Visit us or message us on WhatsApp.</p><address className="mt-5 not-italic text-sm font-semibold leading-6 text-white">{address}</address><a href={whatsapp} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#25D366]">WhatsApp: +91 88262 97238 <Icon name="arrowUpRight" /></a></div><div className="flex flex-wrap gap-3"><a href={whatsapp} target="_blank" rel="noreferrer" className="btn !min-h-12 !rounded-xl bg-[#25D366] px-5 py-3 text-[#0B0B0B] hover:bg-[#20BD5A]">Chat on WhatsApp <Icon name="arrowUpRight" /></a><a href={directions} target="_blank" rel="noreferrer" className="btn !min-h-12 !rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-white hover:bg-white/20">Get directions <Icon name="arrowUpRight" /></a></div></div></div>
      </section>
    </main>

    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8"><div><BrandLogo imageClassName="h-9 w-9" nameClassName="font-bold text-slate-900"/><p className="mt-3 max-w-md text-sm leading-6 text-slate-500">A neighborhood tuition center led by Manish and Tanisha in Mangol Puri, New Delhi.</p></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">{nav.map(([label, href]) => <a key={href} href={href} className="hover:text-brand">{label}</a>)}<Link to={adminHref} className="hover:text-brand">Admin sign in</Link></div></div>
      <div className="border-t border-slate-100"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-4 text-xs text-slate-400 sm:px-6 lg:px-8"><span>© {new Date().getFullYear()} Akatsuki</span><span>Mangol Puri, New Delhi</span></div></div>
    </footer>
  </div>;
}
