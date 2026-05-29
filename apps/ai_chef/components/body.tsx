'use client'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function Mainbody() {
  const containerRef = useRef(null)
  const heroImgRef = useRef(null)
  const spiceRef = useRef(null)
  const headlineRef = useRef(null)
  const subRef = useRef(null)
  const ctaRef = useRef(null)
  const navRef = useRef(null)
  const tomatoRef = useRef(null)
  const Router = useRouter()

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo(
      navRef.current,
      { autoAlpha: 0, y: -16 },
      { autoAlpha: 1, y: 0, duration: 0.7 }
    )
      .fromTo(
        headlineRef.current,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.8 },
        '-=0.2'
      )
      .fromTo(
        [subRef.current, ctaRef.current],
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
        },
        '-=0.4'
      )
      .fromTo(
        heroImgRef.current,
        { autoAlpha: 0, x: 60, scale: 0.94 },
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          duration: 1,
        },
        '-=0.9'
      )
      .fromTo(
        [spiceRef.current, tomatoRef.current],
        { autoAlpha: 0, scale: 0.85 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.9,
          stagger: 0.15,
        },
        '-=0.5'
      )
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-[#faf8f4]"
      style={{
        fontFamily:
          "'Cormorant Garamond', Georgia, serif",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at 70% 50%, #fff3e820 0%, transparent 70%)',
        }}
      />

      {/* Nav */}
      <nav
        ref={navRef}
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 py-6 z-30"
      >
        <span
          style={{
            fontFamily:
              "'Cormorant Garamond', serif",
            fontSize: '1.4rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          luscious
        </span>

        <div className="flex items-center gap-8">
          {[
            'Menu',
            'Orders',
            'About',
            'Contact',
          ].map((link) => (
            <a
              key={link}
              href="#"
              style={{
                fontSize: '0.85rem',
                letterSpacing: '0.06em',
                color: '#555',
                textDecoration: 'none',
                fontFamily:
                  "'DM Sans', sans-serif",
              }}
              className="hover:text-black transition-colors duration-200"
            >
              {link.toUpperCase()}
            </a>
          ))}

          <button
            onClick={() => Router.push('/signin')}
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              padding: '8px 22px',
              border: '1px solid #d4a96a',
              borderRadius: '100px',
              background: 'transparent',
              color: '#d4a96a',
              cursor: 'pointer',
              fontFamily:
                "'DM Sans', sans-serif",
            }}
          >
            LOGIN
          </button>
        </div>
      </nav>

      <div className="grid grid-cols-12 h-full max-w-6xl mx-auto px-10 items-center pt-16">

        {/* Left */}
        <div className="col-span-5 flex flex-col justify-center gap-5">
          <p
            ref={subRef}
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.16em',
              color: '#d4a96a',
              fontFamily:
                "'DM Sans', sans-serif",
            }}
          >
            PREMIUM DINING EXPERIENCE
          </p>

          <h1
            ref={headlineRef}
            style={{
              fontSize:
                'clamp(2.8rem, 4vw, 4.2rem)',
              lineHeight: 1.08,
              fontWeight: 500,
              color: '#1a1a18',
              margin: 0,
            }}
          >
            Fresh flavours,
            <br />
            <em
              style={{
                fontStyle: 'italic',
                color: '#8c6d45',
              }}
            >
              delivered fast.
            </em>
          </h1>

          <p
            style={{
              fontSize: '0.95rem',
              color: '#777',
              lineHeight: 1.75,
              maxWidth: '340px',
              margin: 0,
              fontFamily:
                "'DM Sans', sans-serif",
              fontWeight: 300,
            }}
          >
            Order restaurant-quality biryanis,
            burgers, noodles, desserts and
            refreshing drinks directly from your
            phone.
          </p>

          <div
            ref={ctaRef}
            className="flex items-center gap-4 mt-2"
          >
            <button
              onClick={() => Router.push('/menu')}
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                padding: '12px 28px',
                background: '#1a1a18',
                color: '#faf8f4',
                border: 'none',
                borderRadius: '100px',
                cursor: 'pointer',
                fontFamily:
                  "'DM Sans', sans-serif",
              }}
            >
              EXPLORE MENU
            </button>

            <span
              style={{
                fontSize: '0.8rem',
                color: '#aaa',
                letterSpacing: '0.06em',
                fontFamily:
                  "'DM Sans', sans-serif",
              }}
            >
              50+ signature dishes
            </span>
          </div>
        </div>

        {/* Hero */}
        <div
          className="col-span-4 flex items-center justify-center relative"
          style={{ height: '72vh' }}
        >
          <div
            style={{
              position: 'absolute',
              width: '420px',
              height: '420px',
              borderRadius: '50%',
              background: '#f0e6d3',
              top: '50%',
              left: '50%',
              transform:
                'translate(-50%, -50%)',
            }}
          />

          <img
            ref={heroImgRef}
            src="./momo.png"
            alt="Restaurant Food"
            style={{
              width: '440px',
              maxWidth: '100%',
              position: 'relative',
              zIndex: 2,
              borderRadius: '24px',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Right */}
        <div className="col-span-3 flex flex-col items-start justify-center gap-8 pl-4">
          <img
            ref={tomatoRef}
            src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=400&auto=format&fit=crop"
            alt="Food"
            style={{
              width: '72px',
              opacity: 0.85,
              borderRadius: '12px',
            }}
          />

          <div
            style={{
              borderLeft: '2px solid #d4a96a',
              paddingLeft: '16px',
            }}
          >
            <p
              style={{
                fontSize: '2rem',
                fontWeight: 500,
                color: '#1a1a18',
                margin: 0,
              }}
            >
              4.9
            </p>

            <p
              style={{
                fontSize: '0.75rem',
                color: '#aaa',
              }}
            >
              CUSTOMER RATING
            </p>
          </div>

          <div
            style={{
              borderLeft: '2px solid #e8ddd0',
              paddingLeft: '16px',
            }}
          >
            <p
              style={{
                fontSize: '2rem',
                fontWeight: 500,
                color: '#1a1a18',
                margin: 0,
              }}
            >
              12k+
            </p>

            <p
              style={{
                fontSize: '0.75rem',
                color: '#aaa',
              }}
            >
              ORDERS DELIVERED
            </p>
          </div>
        </div>
      </div>

      <img
        ref={spiceRef}
        src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=400&auto=format&fit=crop"
        alt="Spices"
        style={{
          position: 'absolute',
          left: '3%',
          bottom: '8%',
          width: '90px',
          opacity: 0.55,
          borderRadius: '14px',
        }}
      />
    </div>
  )
}