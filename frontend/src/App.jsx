import AppRoutes from "./routes/AppRoutes";
import { LanguageProvider } from "./context/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppRoutes />
      </LanguageProvider>
    </ErrorBoundary>
  );
}
