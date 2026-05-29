"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { getOrCreateSessionId, useMenu } from "@/lib/orderFlow";

type MenuItem = {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  category: string;
  price: number;
  rating?: number;
  reviews?: number;
  tag?: string;
};

type StarRatingProps = {
  rating?: number;
};

type MenuCardProps = {
  item: MenuItem;
  onAdd: () => Promise<void>;
};

const categories = [
  "All",
  "Biryani",
  "Noodles",
  "Mojitos",
  "Burgers",
  "Desserts",
  "Salads",
];

function StarRating({
  rating = 4.7,
}: StarRatingProps) {
  return (
    <span
      style={{
        color: "#e8773a",
        fontSize: "0.75rem",
        letterSpacing: 1,
      }}
    >
      {"★".repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? "½" : ""}

      <span
        style={{
          color: "#c8bfb0",
          marginLeft: 4,
          fontFamily: "inherit",
        }}
      >
        {rating}
      </span>
    </span>
  );
}

function MenuCard({
  item,
  onAdd,
}: MenuCardProps) {
  const [added, setAdded] =
    useState(false);

  const handleAdd = async () => {
    try {
      await onAdd();

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1800);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="menu-card">
      <div className="card-emoji-wrap">
        <span className="card-emoji">
          {item.image || "🍛"}
        </span>
      </div>

      {item.tag && (
        <span className="card-tag">
          {item.tag}
        </span>
      )}

      <div className="card-body">
        <h3 className="card-name">
          {item.name}
        </h3>

        <p className="card-desc">
          {item.description ||
            "Freshly prepared with premium ingredients."}
        </p>

        <div className="card-meta">
          <StarRating
            rating={
              item.rating || 4.7
            }
          />

          <span className="card-reviews">
            (
            {item.reviews ||
              120}
            )
          </span>
        </div>

        <div className="card-footer">
          <span className="card-price">
            ₹{item.price}
          </span>

          <button
            className={`card-btn ${
              added
                ? "added"
                : ""
            }`}
            onClick={handleAdd}
          >
            {added
              ? "✓ Added"
              : "+ Add"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .menu-card {
          background: #faf8f5;
          border: 1px solid #ede8e0;
          border-radius: 18px;
          padding: 0 0 20px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition:
            transform 0.28s
              cubic-bezier(
                0.34,
                1.56,
                0.64,
                1
              ),
            box-shadow 0.28s ease,
            border-color 0.2s ease;
        }

        .menu-card:hover {
          transform: translateY(-6px);

          box-shadow:
            0 16px 40px
            rgba(
              80,
              50,
              20,
              0.1
            );

          border-color: #e8773a44;
        }

        .card-emoji-wrap {
          background: linear-gradient(
            135deg,
            #fff8f3 0%,
            #fdeedd 100%
          );

          display: flex;
          align-items: center;
          justify-content: center;
          height: 110px;
          border-radius: 16px
            16px 0 0;
          font-size: 3.5rem;
          transition:
            transform 0.3s
            ease;
        }

        .menu-card:hover
          .card-emoji-wrap {
          transform: scale(1.04);
        }

        .card-emoji {
          display: inline-block;

          transition:
            transform 0.4s
            cubic-bezier(
              0.34,
              1.56,
              0.64,
              1
            );

          filter: drop-shadow(
            0 4px 8px
              rgba(
                0,
                0,
                0,
                0.08
              )
          );
        }

        .menu-card:hover
          .card-emoji {
          transform: rotate(-8deg)
            scale(1.15);
        }

        .card-tag {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #e8773a;
          color: #fff;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 3px 9px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .card-body {
          padding: 16px 18px 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .card-name {
          font-family:
            "Playfair Display",
            serif;

          font-size: 1.05rem;
          font-weight: 700;
          color: #1a1208;
          margin: 0;
          line-height: 1.3;
        }

        .card-desc {
          font-size: 0.78rem;
          color: #7a6a55;
          margin: 0;
          line-height: 1.5;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }

        .card-reviews {
          font-size: 0.72rem;
          color: #b0a090;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
        }

        .card-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1208;
        }

        .card-btn {
          background: transparent;
          border: 1.5px solid
            #e8773a;

          color: #e8773a;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 7px 18px;
          border-radius: 50px;
          cursor: pointer;

          transition:
            background 0.22s
              ease,
            color 0.22s ease,
            transform 0.18s
              cubic-bezier(
                0.34,
                1.56,
                0.64,
                1
              ),
            box-shadow 0.2s ease;
        }

        .card-btn:hover {
          background: #e8773a;
          color: #fff;

          transform: scale(1.06);

          box-shadow:
            0 4px 14px
            rgba(
              232,
              119,
              58,
              0.35
            );
        }

        .card-btn.added {
          background: #2a9d6a;
          border-color: #2a9d6a;
          color: #fff;
        }
      `}</style>
    </div>
  );
}

export default function MenuPage() {
  const {
    items,
    loading,
    fetchItems,
    addItemToCart,
  } = useMenu();

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("All");

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered =
    useMemo(() => {
      if (
        activeCategory === "All"
      ) {
        return items;
      }

      return items.filter(
        (
          item: MenuItem
        ) =>
          item.category ===
          activeCategory
      );
    }, [
      items,
      activeCategory,
    ]);

  const handleAddToCart =
    async (
      item: MenuItem
    ) => {
      try {
        const sessionId = getOrCreateSessionId();

        await addItemToCart({
          sessionId,
          dishId: item._id,
          quantity: 1,
        });
      } catch (error) {
        console.error(
          "Add to cart failed",
          error
        );
      }
    };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #fffdf9;
        }

        .menu-page {
          min-height: 100vh;

          background:
            radial-gradient(
              circle at top,
              #fff6ef 0%,
              #fffdf9 45%
            );

          font-family:
            'DM Sans',
            sans-serif;

          padding: 50px 24px 80px;
        }

        .menu-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .menu-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .menu-eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #e8773a;
          margin-bottom: 8px;
        }

        .menu-title {
          font-family:
            'Playfair Display',
            serif;

          font-size: clamp(
            2.3rem,
            5vw,
            4rem
          );

          font-weight: 700;
          color: #1a1208;
          margin: 0 0 10px;
          line-height: 1.1;
        }

        .menu-subtitle {
          color: #7a6a55;
          font-size: 1rem;
        }

        .category-bar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 36px;
        }

        .cat-btn {
          background: transparent;

          border: 1.5px solid
            #ede8e0;

          color: #7a6a55;

          font-size: 0.85rem;
          font-weight: 500;

          padding: 8px 20px;

          border-radius: 50px;

          cursor: pointer;

          transition: all 0.22s
            cubic-bezier(
              0.34,
              1.56,
              0.64,
              1
            );
        }

        .cat-btn:hover {
          border-color: #e8773a;
          color: #e8773a;
          transform: translateY(-2px);
        }

        .cat-btn.active {
          background: #e8773a;
          border-color: #e8773a;
          color: white;

          box-shadow:
            0 4px 16px
            rgba(
              232,
              119,
              58,
              0.3
            );
        }

        .menu-count {
          text-align: center;
          margin-bottom: 22px;
          color: #b0a090;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
        }

        .menu-grid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fill,
              minmax(
                240px,
                1fr
              )
            );

          gap: 22px;

          animation:
            gridFadeIn 0.45s
            ease;
        }

        .loading {
          text-align: center;
          padding: 80px 0;
          color: #7a6a55;
          font-size: 1rem;
        }

        @keyframes gridFadeIn {
          from {
            opacity: 0;
            transform:
              translateY(12px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }

        @media (
          max-width: 768px
        ) {
          .menu-page {
            padding:
              36px
              16px
              60px;
          }

          .menu-grid {
            grid-template-columns:
              1fr;
          }
        }
      `}</style>

      <div className="menu-page">
        <div className="menu-container">
          <div className="menu-header">
            <p className="menu-eyebrow">
              Explore Our Menu
            </p>

            <h1 className="menu-title">
              What are you craving?
            </h1>

            <p className="menu-subtitle">
              Life is so endlessly
              delicious.
            </p>
          </div>

          <div className="category-bar">
            {categories.map(
              (cat) => (
                <button
                  key={cat}
                  className={`cat-btn ${
                    activeCategory ===
                    cat
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveCategory(
                      cat
                    )
                  }
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <p className="menu-count">
            {filtered.length} items
          </p>

          {loading ? (
            <div className="loading">
              Loading menu...
            </div>
          ) : (
            <div className="menu-grid">
              {filtered.map(
                (
                  item: MenuItem
                ) => (
                  <MenuCard
                    key={item._id}
                    item={item}
                    onAdd={() =>
                      handleAddToCart(
                        item
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}