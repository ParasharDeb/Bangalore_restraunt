"use client";

export default function LoadingPage() {
  return (
    <>
      <div className="loading-container">
        <div className="loading-content">
          <div className="loader">
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
          </div>
          
          <h2 className="loading-title">Preparing your feast</h2>
          <p className="loading-subtitle">Getting everything ready...</p>
          
          <div className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #0f0d09 0%,
            #1a1610 50%,
            #0f0d09 100%
          );
        }

        .loading-content {
          text-align: center;
        }

        .loader {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 40px;
        }

        .loader-ring {
          position: absolute;
          width: 80px;
          height: 80px;
          border: 3px solid transparent;
          border-top-color: #e8773a;
          border-right-color: #e8773a;
          border-radius: 50%;
          animation: spin 1.5s linear infinite;
        }

        .loader-ring:nth-child(1) {
          animation-delay: 0s;
          width: 80px;
          height: 80px;
        }

        .loader-ring:nth-child(2) {
          animation-delay: -0.5s;
          width: 60px;
          height: 60px;
          top: 10px;
          left: 10px;
          border-top-color: #ff9f68;
        }

        .loader-ring:nth-child(3) {
          animation-delay: -1s;
          width: 40px;
          height: 40px;
          top: 20px;
          left: 20px;
          border-top-color: #d4692e;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .loading-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #f5ede0;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        .loading-subtitle {
          font-size: 0.95rem;
          color: #a38c79;
          margin: 0 0 32px 0;
        }

        .loading-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e8773a;
          animation: bounce 1.4s infinite;
        }

        .dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
