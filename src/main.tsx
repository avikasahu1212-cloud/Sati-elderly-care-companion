import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class SatiErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#1C2422] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5DDD0] p-8 text-center space-y-4">
            <h1 className="font-display text-2xl font-bold text-[#0F5C58]">
              Sati is taking a quick breath
            </h1>
            <p className="text-base text-[#52605C]">
              Something unexpected happened. Please tap below to reload your care circle safely.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full min-h-[52px] rounded-2xl bg-[#0F5C58] text-white font-bold text-lg cursor-pointer"
            >
              Reload Sati
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <SatiErrorBoundary>
    <App />
  </SatiErrorBoundary>
);
