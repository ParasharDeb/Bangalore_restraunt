'use client'

const reviews = [
  {
    avatar:
      'https://randomuser.me/api/portraits/women/44.jpg',
    name: 'Aarav Sharma',
    role: 'Regular customer',
    text: 'The biryani is genuinely one of the best in the city. Ordering from the table makes everything super convenient.',
    rating: 5,
  },

  {
    avatar:
      'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'Emily Chen',
    role: 'Food reviewer',
    text: 'Fast service, amazing presentation and the mojitos were incredibly refreshing.',
    rating: 5,
  },

  {
    avatar:
      'https://randomuser.me/api/portraits/women/68.jpg',
    name: 'Rohan Kapoor',
    role: 'Weekend foodie',
    text: 'The ordering system is smooth and the food arrived surprisingly fast.',
    rating: 5,
  },
]

export default function LargeRecipe() {
  return (
    <div
      style={{
        background: '#faf8f4',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '80px 40px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              width: '88%',
              aspectRatio: '1',
              borderRadius: '50%',
              background: '#f0e6d3',
              top: '50%',
              left: '50%',
              transform:
                'translate(-46%, -50%)',
            }}
          />

          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop"
            alt="Restaurant"
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: '440px',
              borderRadius: '24px',
            }}
          />
        </div>

        <div>
          <p
            style={{
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              color: '#d4a96a',
              marginBottom: '12px',
            }}
          >
            CUSTOMER REVIEWS
          </p>

          <h2
            style={{
              fontFamily:
                "'Cormorant Garamond', serif",
              fontSize:
                'clamp(2rem, 3vw, 2.8rem)',
              fontWeight: 400,
              color: '#1a1a18',
              margin: '0 0 40px',
            }}
          >
            Loved by
            <br />
            <em>food lovers</em>
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {reviews.map((r) => (
              <div
                key={r.name}
                style={{
                  padding: '20px 24px',
                  background: '#fff',
                  borderRadius: '12px',
                  border:
                    '1px solid #ede8e0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '3px',
                    marginBottom: '10px',
                  }}
                >
                  {Array.from({
                    length: r.rating,
                  }).map((_, s) => (
                    <span
                      key={s}
                      style={{
                        color: '#d4a96a',
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#555',
                    lineHeight: 1.7,
                  }}
                >
                  "{r.text}"
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <img
                    src={r.avatar}
                    alt={r.name}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: '#1a1a18',
                      }}
                    >
                      {r.name}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.72rem',
                        color: '#aaa',
                      }}
                    >
                      {r.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}