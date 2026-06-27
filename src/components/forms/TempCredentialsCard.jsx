import { useState } from 'react';

/**
 * Displays a newly-created account's email + one-time temp password.
 * The backend returns tempPassword exactly once in the creation
 * response (see admin.controller.js createMentor/createStudent) —
 * there is no email service in V1, so the admin must copy this and
 * communicate it manually.
 */
export default function TempCredentialsCard({ email, tempPassword }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`Email: ${email}\nTemporary password: ${tempPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-md border border-accent/30 bg-accent-soft p-4">
      <p className="text-sm font-medium text-accent-dark">Account created — share these credentials now</p>
      <p className="mt-1 text-xs text-accent-dark/80">
        This password is shown only once. There is no email service in V1, so you must communicate it manually.
      </p>
      <div className="mt-3 space-y-1 rounded-md bg-surface p-3 font-mono text-sm text-ink">
        <p>Email: {email}</p>
        <p>Temporary password: {tempPassword}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-3 text-xs font-medium text-accent-dark underline hover:no-underline"
      >
        {copied ? 'Copied!' : 'Copy to clipboard'}
      </button>
    </div>
  );
}
