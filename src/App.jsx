import { ToastProvider } from './components/common/Toast';
import AppRoutes from './routes/AppRoutes';
import ForcePasswordResetGate from './routes/ForcePasswordResetGate';

export default function App() {
  return (
    <ToastProvider>
      <ForcePasswordResetGate>
        <AppRoutes />
      </ForcePasswordResetGate>
    </ToastProvider>
  );
}
