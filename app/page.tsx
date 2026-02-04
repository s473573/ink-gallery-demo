'use client';

import * as React from 'react';
import { FluidStage } from '@/components/FluidStage'
import { Gallery } from '@/components/Gallery'

export default function Page() {
  return (
    <FluidStage showStatus={true}>
      <main className="page">
        <header className="hero">
          <div className="hero__inner">
            <div className="hero__kicker">Welcome</div>
            <h1 className="hero__title">Try me out</h1>
            <p className="hero__lead">
              Hover to stir the background. Click a card to pin it. Press Escape to close.
            </p>

            <div className="hero__row">
              <div className="hero__pill">TypeScript unions</div>
              <div className="hero__pill">Reducer state machine</div>
              <div className="hero__pill">Accessible interactions</div>
            </div>
          </div>
        </header>

        <Gallery />

        <footer className="footer">
          <div className="footer__inner">
            <span className="footer__muted">Built as a learning run.</span>
            <span className="footer__dot" aria-hidden="true">
              ·
            </span>
            <span className="footer__muted">Hover is optional.</span>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        html,
        body {
          height: 100%;
        }

        body {
          margin: 0;
          color: rgba(255, 255, 255, 0.92);
          background: #07080b;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji';
        }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-rows: auto 1fr auto;
        }

        /* Hero */
        .hero {
          width: min(1120px, calc(100% - 48px));
          margin: 0 auto;
          padding: 34px 0 6px;
        }

        @media (max-width: 980px) {
          .hero {
            width: min(920px, calc(100% - 32px));
            padding: 28px 0 6px;
          }
        }

        @media (max-width: 720px) {
          .hero {
            width: min(640px, calc(100% - 28px));
            padding: 22px 0 4px;
          }
        }

        .hero__inner {
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 18px 55px rgba(0, 0, 0, 0.35);
          padding: 18px 18px 16px;
          backdrop-filter: blur(6px);
        }

        .hero__kicker {
          font-size: 12px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.62);
        }

        .hero__title {
          margin: 10px 0 0;
          font-size: 26px;
          line-height: 1.15;
          letter-spacing: -0.6px;
          font-weight: 680;
          color: rgba(255, 255, 255, 0.94);
        }

        @media (max-width: 720px) {
          .hero__title {
            font-size: 22px;
          }
        }

        .hero__lead {
          margin: 10px 0 0;
          font-size: 13.5px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.70);
          max-width: 70ch;
        }

        .hero__row {
          margin-top: 14px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .hero__pill {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 10px;
          border-radius: 999px;
        }

        /* Footer */
        .footer {
          width: min(1120px, calc(100% - 48px));
          margin: 0 auto;
          padding: 10px 0 28px;
        }

        @media (max-width: 980px) {
          .footer {
            width: min(920px, calc(100% - 32px));
          }
        }

        @media (max-width: 720px) {
          .footer {
            width: min(640px, calc(100% - 28px));
          }
        }

        .footer__inner {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255, 255, 255, 0.58);
          font-size: 12px;
        }

        .footer__dot {
          opacity: 0.55;
        }
      `}</style>
    </FluidStage>
  );
}