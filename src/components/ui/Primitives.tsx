import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Info,
  Loader2,
  XCircle,
} from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
    secondary:
      'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    danger:
      'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'text-xs px-3 py-2 min-h-[36px]',
    md: 'text-sm px-4 py-2 min-h-[42px]',
    lg: 'text-sm px-6 py-3 min-h-[46px]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Card({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function StatusText({
  tone,
  label,
}: {
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'error';
  label: string;
}) {
  const styles: Record<typeof tone, string> = {
    neutral: 'text-slate-600 dark:text-slate-400',
    info: 'text-sky-700 dark:text-sky-400',
    success: 'text-emerald-700 dark:text-emerald-400',
    warning: 'text-amber-700 dark:text-amber-400',
    error: 'text-red-700 dark:text-red-400',
  };

  const Icon =
    tone === 'success'
      ? CheckCircle2
      : tone === 'error'
        ? XCircle
        : tone === 'warning'
          ? AlertCircle
          : Info;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${styles[tone]}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function AlertBanner({
  tone = 'info',
  title,
  message,
  onRetry,
  retryLabel = 'Retry',
}: {
  tone?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const styles: Record<typeof tone, string> = {
    info: 'bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/40 dark:border-sky-900 dark:text-sky-100',
    success:
      'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-100',
    warning:
      'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-100',
    error:
      'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-900 dark:text-red-100',
  };

  const Icon =
    tone === 'success'
      ? CheckCircle2
      : tone === 'error'
        ? XCircle
        : tone === 'warning'
          ? AlertCircle
          : Info;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${styles[tone]}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-0.5 text-sm">
          {title && <p className="font-semibold">{title}</p>}
          <p className="opacity-90 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export function CodeBlock({
  title,
  language,
  code,
  previewHtml,
}: {
  title?: string;
  language: string;
  code: string;
  previewHtml?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API fallback omitted cleanly
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300 truncate">
          <span className="font-mono uppercase text-sky-400">{language}</span>
          {title && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="truncate font-medium">{title}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {previewHtml && (
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{showPreview ? 'Hide Preview' : 'Sandboxed Preview'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <pre className="p-4 overflow-x-auto text-xs sm:text-sm leading-relaxed font-mono text-slate-100">
        <code>{code}</code>
      </pre>

      {showPreview && previewHtml && (
        <div className="border-t border-slate-800 bg-white">
          <div className="px-4 py-1.5 bg-slate-100 border-b border-slate-200 text-[11px] font-medium text-slate-600">
            Sandboxed HTML/CSS Output (scripts disabled)
          </div>
          <iframe
            title={title ? `Preview: ${title}` : 'Sandboxed example preview'}
            sandbox=""
            srcDoc={previewHtml}
            className="w-full h-44 bg-white border-0"
          />
        </div>
      )}
    </div>
  );
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
}
