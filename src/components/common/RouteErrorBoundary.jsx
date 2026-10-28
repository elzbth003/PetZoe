import React, { useState } from 'react';
import { useRouteError, isRouteErrorResponse, Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, ChevronDown, ChevronUp, ShieldAlert, PawPrint } from 'lucide-react';

export default function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const errorMessage = isRouteErrorResponse(error)
    ? error.data?.message || error.statusText
    : error instanceof Error
    ? error.message
    : 'An unexpected application error occurred.';

  const errorStack = error instanceof Error ? error.stack : null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 text-center space-y-6">
        
        {/* Brand Icon Badge */}
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
          {is404 ? (
            <PawPrint size={32} className="text-amber-500 animate-pulse" />
          ) : (
            <AlertTriangle size={32} className="text-amber-500" />
          )}
        </div>

        {/* Title and Explanation */}
        <div className="space-y-2">
          <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight">
            {is404 ? 'Page Not Found' : 'Something Went Wrong'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
            {is404
              ? "The page you are looking for doesn't exist or has been moved."
              : 'PetZoe encountered an unexpected issue while loading this view.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#112A46] hover:bg-[#1E3A5F] text-white shadow-md shadow-[#112A46]/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={14} />
            Reload Page
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Home size={14} />
            Home
          </Link>
        </div>

        {/* Technical Error Details (Collapsible for developers/admin) */}
        {!is404 && (
          <div className="pt-4 border-t border-slate-100 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center justify-between w-full transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <ShieldAlert size={12} />
                Technical Information
              </span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showDetails && (
              <div className="mt-3 p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] space-y-2 overflow-x-auto max-h-48">
                <div className="text-rose-400 font-bold">{errorMessage}</div>
                {errorStack && (
                  <pre className="text-slate-400 whitespace-pre-wrap leading-tight text-[9px]">
                    {errorStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
