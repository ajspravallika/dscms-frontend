export default function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-2 rounded-md border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}
