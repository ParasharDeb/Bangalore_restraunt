'use client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

const footerLinks = {
  'Get Cooking': ['Easy Asian Takeout', 'Recipe Gallery', 'Ingredients Guide', 'Weekly Meal Plans', 'Conversion Tool'],
  'Information': ['About', 'Privacy Policy', 'Disclosure', 'Contact'],
  'Follow Us': ['Instagram', 'Youtube', 'Pinterest', 'Facebook'],
}

export default function Footer() {
  const footerRef = useRef(null)
  const emailSectionRef = useRef(null)
  const linksRef = useRef(null)
  const accentImgRefs = useRef<(HTMLImageElement | null)[]>([])

  useGSAP(() => {
    gsap.fromTo(
      emailSectionRef.current,
      { autoAlpha: 0, y: 32 },
      {
        autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: footerRef.current, start: 'top 85%' }
      }
    )
    gsap.fromTo(
      linksRef.current,
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.2,
        scrollTrigger: { trigger: footerRef.current, start: 'top 85%' }
      }
    )
    // Subtle accent images — only 2, small
    gsap.fromTo(
      accentImgRefs.current.filter(Boolean),
      { autoAlpha: 0, scale: 0.8 },
      {
        autoAlpha: 1, scale: 1, duration: 1, stagger: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: footerRef.current, start: 'top 85%' }
      }
    )
  }, [])

  return (
    <footer
      ref={footerRef}
      style={{
        background: '#1a1a18',
        padding: '72px 40px 40px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .footer-link { color: #555; font-size: 0.85rem; text-decoration: none; transition: color 0.2s ease; line-height: 2.1; display: block; }
        .footer-link:hover { color: #d4a96a; }
      `}</style>

      {/* Subtle decorative images — 2 max, small and tasteful */}
      <img
        ref={el => { accentImgRefs.current[0] = el }}
        src="/star-anise.png"
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', top: '40px', right: '60px', width: '52px', opacity: 0.18 }}
      />
      <img
        ref={el => { accentImgRefs.current[1] = el }}
        src="/chili.png"
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', bottom: '80px', left: '40px', width: '36px', opacity: 0.15, transform: 'rotate(-20deg)' }}
      />

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Email signup */}
        <div
          ref={emailSectionRef}
          style={{
            borderBottom: '1px solid #2a2a27',
            paddingBottom: '56px',
            marginBottom: '48px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1.8rem, 2.5vw, 2.4rem)',
              fontWeight: 400,
              color: '#faf8f4',
              margin: '0 0 10px',
              lineHeight: 1.2,
            }}>
              Recipes, straight<br />to <em>your inbox</em>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#555', margin: 0, fontWeight: 300, lineHeight: 1.6 }}>
              Weekly drops of the best Chinese home recipes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                flex: 1,
                padding: '12px 18px',
                background: '#242420',
                border: '1px solid #333',
                borderRadius: '100px',
                color: '#faf8f4',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button style={{
              padding: '12px 22px',
              background: '#d4a96a',
              border: 'none',
              borderRadius: '100px',
              color: '#1a1a18',
              fontSize: '0.78rem',
              fontWeight: 500,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = '#c49355' }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = '#d4a96a' }}
            >
              SUBSCRIBE
            </button>
          </div>
        </div>

        {/* Links grid */}
        <div ref={linksRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginBottom: '48px' }}>
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <p style={{ fontSize: '0.72rem', letterSpacing: '0.16em', color: '#d4a96a', marginBottom: '12px' }}>
                {heading.toUpperCase()}
              </p>
              <nav>
                {links.map(link => (
                  <a key={link} href="#" className="footer-link">{link}</a>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid #2a2a27',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#faf8f4' }}>luscious</span>
          <span style={{ fontSize: '0.75rem', color: '#3a3a36', letterSpacing: '0.04em' }}>
            © 2025 Luscious. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}