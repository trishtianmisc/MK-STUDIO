import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import About from "./pages/About";
import AdminAccess from "./pages/AdminAccess";
import AdminPreview from "./pages/AdminPreview";
import Catalogue from "./pages/Catalogue";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";

function ProtectedAdminRoute() {
  const { user, loading, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <main className="admin-access-page">
        <section className="admin-access-panel">
          <p className="admin-access-intro">Loading...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    setLocation("/admin");
    return null;
  }

  if (!isAdmin) {
    return (
      <main className="admin-access-page">
        <section className="admin-access-panel">
          <div className="admin-access-mark">!</div>
          <p className="eyebrow">Access denied</p>
          <h1>Unauthorized<br /><em>access.</em></h1>
          <p className="admin-access-intro">
            You do not have permission to access the admin area.
            Your account does not have administrator privileges.
          </p>
          <button className="editorial-button editorial-button-light" onClick={() => setLocation("/")}>
            Return to MK Studio
          </button>
        </section>
      </main>
    );
  }

  return <AdminPreview />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/catalogue"} component={Catalogue} />
      <Route path={"/catalogue/:slug"} component={ProductDetail} />
      <Route path={"/about"} component={About} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/admin"} component={AdminAccess} />
      <Route path={"/admin/dashboard"} component={ProtectedAdminRoute} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
