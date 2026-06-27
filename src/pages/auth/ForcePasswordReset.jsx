import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import * as authApi from '../../api/auth.api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';

/**
 * Shown when user.mustResetPassword is true (set by default on every
 * admin-created account — see backend User.model.js). Forces a
 * password change before the user can reach their dashboard.
 */
export default function ForcePasswordReset() {
  const { user, updateStoredUser, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      setError('New password must be at least 8 characters and include a number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      updateStoredUser({ ...user, mustResetPassword: false });
      navigate(`/${user.role}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 h-1.5 w-10 rounded-full bg-accent" aria-hidden="true" />
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">Set a new password</h1>
          <p className="mt-1 text-sm text-muted">
            This is your first sign-in. Choose a permanent password to continue.
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Temporary password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && <ErrorBanner message={error} />}

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Update password
            </Button>
            <button
              type="button"
              onClick={logout}
              className="w-full text-center text-xs text-muted hover:text-ink"
            >
              Sign out instead
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
