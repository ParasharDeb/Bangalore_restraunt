'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useRef, useState, useEffect } from 'react'

gsap.registerPlugin(ScrollTrigger)

export default function Menu() {
  const containerRef = useRef(null)
  const headerRef = useRef(null)
  const tabsRef = useRef(null)

  const [activeTab, setActiveTab] = useState('Biryani')

  const dishes = {
    Starters: [
      {
        name: 'Chicken Popcorn',
        desc: 'Crispy bite-sized chicken served with smoky garlic mayo.',
        price: '₹199',
      },
      {
        name: 'Loaded Fries',
        desc: 'Cheesy peri-peri fries topped with jalapeños and herbs.',
        price: '₹149',
      },
      {
        name: 'Paneer Tikka',
        desc: 'Char-grilled paneer cubes marinated in house spices.',
        price: '₹229',
      },
    ],

    Biryani: [
      {
        name: 'Chicken Dum Biryani',
        desc: 'Slow-cooked fragrant basmati rice layered with tender chicken and aromatic spices.',
        price: '₹299',
      },
      {
        name: 'Mutton Biryani',
        desc: 'Rich and flavourful mutton biryani finished with saffron and fried onions.',
        price: '₹399',
      },
      {
        name: 'Veg Hyderabadi Biryani',
        desc: 'Garden vegetables cooked with royal spices and long-grain rice.',
        price: '₹249',
      },
    ],

    Drinks: [
      {
        name: 'Virgin Mojito',
        desc: 'Fresh mint, lime and sparkling soda served ice cold.',
        price: '₹119',
      },
      {
        name: 'Watermelon Cooler',
        desc: 'Refreshing watermelon blend with citrus and basil.',
        price: '₹139',
      },
      {
        name: 'Cold Coffee',
        desc: 'Creamy chilled coffee topped with chocolate drizzle.',
        price: '₹159',
      },
    ],
  }

  const cardRefs = useRef([])

  const currentDishes = dishes[activeTab]

  useGSAP(() => {
    gsap.fromTo(
      [headerRef.current, tabsRef.current],
      {
        autoAlpha: 0,
        y: 24,
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
      }
    )
  }, [])

  useEffect(() => {
    gsap.fromTo(
      cardRefs.current,
      {
        autoAlpha: 0,
        y: 30,
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
      }
    )
  }, [activeTab])

  return (
    <div
      ref={containerRef}
      style={{
        background: '#1a1a18',
        minHeight: '100vh',
        padding: '80px 24px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '860px',
          margin: '0 auto',
        }}
      >
        <div ref={headerRef} style={{ marginBottom: '56px' }}>
          <p
            style={{
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              color: '#d4a96a',
              marginBottom: '12px',
            }}
          >
            POPULAR DISHES
          </p>

          <h2
            style={{
              fontFamily:
                "'Cormorant Garamond', serif",
              fontSize: 'clamp(2.4rem, 4vw, 3.6rem)',
              fontWeight: 400,
              color: '#faf8f4',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Freshly made
            <br />
            <em>every single day</em>
          </h2>
        </div>

        <div
          ref={tabsRef}
          style={{
            display: 'flex',
            marginBottom: '48px',
            borderBottom: '1px solid #2e2e2a',
          }}
        >
          {Object.keys(dishes).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom:
                  activeTab === tab
                    ? '2px solid #d4a96a'
                    : '2px solid transparent',
                padding: '12px 24px',
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                color:
                  activeTab === tab
                    ? '#d4a96a'
                    : '#666',
                cursor: 'pointer',
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
            background: '#2a2a27',
          }}
        >
          {currentDishes.map((dish, i) => (
            <div
              key={dish.name}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: '24px',
                padding: '28px 32px',
                background: '#1a1a18',
                border: '1px solid #2a2a27',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontFamily:
                        "'Cormorant Garamond', serif",
                      fontSize: '1.3rem',
                      fontWeight: 500,
                      color: '#faf8f4',
                    }}
                  >
                    {dish.name}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#666',
                    lineHeight: 1.65,
                    margin: 0,
                    maxWidth: '520px',
                    fontWeight: 300,
                  }}
                >
                  {dish.desc}
                </p>
              </div>

              <span
                style={{
                  fontFamily:
                    "'Cormorant Garamond', serif",
                  fontSize: '1.1rem',
                  color: '#d4a96a',
                }}
              >
                {dish.price}
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: '0.75rem',
            color: '#444',
            marginTop: '32px',
          }}
        >
          Order directly from your table or phone
          — fast service, live kitchen updates and
          fresh meals guaranteed.
        </p>
      </div>
    </div>
  )
}