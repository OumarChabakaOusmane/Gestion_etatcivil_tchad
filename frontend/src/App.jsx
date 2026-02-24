import AppRoutes from "./routes/AppRoutes";
import { LanguageProvider } from "./context/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function App() {
  const googleClientId = "474357043996-nhsou313l3pf3v8pv3l76r6bg2hdro9s.apps.googleusercontent.com";

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId}>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}
