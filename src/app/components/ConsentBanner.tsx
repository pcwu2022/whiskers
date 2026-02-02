'use client';

import { useState, useEffect } from 'react';
import {
  shouldShowConsentBanner,
  acceptAnalytics,
  acceptEssentialOnly,
} from '@/lib/analytics';

export default function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check consent state on mount
    setShow(shouldShowConsentBanner());
  }, []);

  if (!show) return null;

  const handleAcceptAll = () => {
    acceptAnalytics();
    setShow(false);
  };

  const handleEssentialOnly = () => {
    acceptEssentialOnly();
    setShow(false);
  };

  return (
    <div className="consent-banner">
      <div className="consent-content">
        <div className="consent-text">
          <p>
            <strong>🍪 Learning Analytics</strong>
          </p>
          <p>
            We use anonymous analytics to understand how students learn and improve Whiskers.
            No personal information is collected.
          </p>
        </div>
        <div className="consent-buttons">
          <button onClick={handleEssentialOnly} className="consent-btn essential">
            Essential Only
          </button>
          <button onClick={handleAcceptAll} className="consent-btn accept">
            Accept Analytics
          </button>
        </div>
      </div>

      <style jsx>{`
        .consent-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(30, 30, 40, 0.98);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px 24px;
          z-index: 9999;
          backdrop-filter: blur(10px);
        }

        .consent-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .consent-text {
          flex: 1;
          min-width: 280px;
        }

        .consent-text p {
          margin: 0;
          color: #e0e0e0;
          font-size: 14px;
          line-height: 1.5;
        }

        .consent-text p:first-child {
          margin-bottom: 4px;
          color: #fff;
        }

        .consent-buttons {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .consent-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .consent-btn.essential {
          background: transparent;
          color: #a0a0a0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .consent-btn.essential:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }

        .consent-btn.accept {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff;
        }

        .consent-btn.accept:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        @media (max-width: 640px) {
          .consent-banner {
            padding: 16px;
          }

          .consent-content {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }

          .consent-buttons {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
