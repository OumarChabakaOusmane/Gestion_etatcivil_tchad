import AppRoutes from "./routes/AppRoutes";
import { LanguageProvider } from "./context/LanguageContext";
import SmsSimulator from "./components/SmsSimulator";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppRoutes />
        <SmsSimulator />
      </LanguageProvider>
    </ErrorBoundary>
  );
}
