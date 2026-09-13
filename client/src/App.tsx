import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import About from "./pages/About";
import Catalogue from "./pages/Catalogue";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import HowRentalWorks from "./pages/HowRentalWorks";
import ListWithUs from "./pages/ListWithUs";
import ProductDetail from "./pages/ProductDetail";
import { Suspense, lazy, useState, useEffect } from "react";
import type { AdminView } from "./components/AdminLayout";
import { Analytics } from "@vercel/analytics/react";

const AdminAccess = lazy(() => import("./pages/AdminAccess"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminRentals = lazy(() => import("./pages/AdminRentals"));

function AdminFallback() {
  return (
    <main className="admin-access-page">
      <section className="admin-access-panel">
        <p className="admin-access-intro">Loading...</p>
      </section>
    </main>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function ProtectedAdminRoute() {
  const { user, loading, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [view, setView] = useState<AdminView>("dashboard");

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
          <h1>
            Unauthorized
            <br />
            <em>access.</em>
          </h1>
          <p className="admin-access-intro">
            You do not have permission to access the admin area. Your account
            does not have administrator privileges.
          </p>
          <button
            className="editorial-button editorial-button-light"
            onClick={() => setLocation("/")}
          >
            Return to MK Studio
          </button>
        </section>
      </main>
    );
  }

  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminLayoutWrapper view={view} setView={setView}>
        <div style={view !== "dashboard" ? { display: "none" } : undefined}><AdminDashboard /></div>
        <div style={view !== "products" ? { display: "none" } : undefined}><AdminProducts /></div>
        <div style={view !== "categories" ? { display: "none" } : undefined}><AdminCategories /></div>
        <div style={view !== "rentals" ? { display: "none" } : undefined}><AdminRentals /></div>
      </AdminLayoutWrapper>
    </Suspense>
  );
}

function AdminLayoutWrapper({
  view,
  setView,
  children,
}: {
  view: AdminView;
  setView: (v: AdminView) => void;
  children: React.ReactNode;
}) {
  return (
    <AdminLayout view={view} setView={setView}>
      {children}
    </AdminLayout>
  );
}

function LazyAdminAccess() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminAccess />
    </Suspense>
  );
}

function LazyProtectedAdminRoute() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <ProtectedAdminRoute />
    </Suspense>
  );
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/catalogue"} component={Catalogue} />
        <Route path={"/catalogue/:slug"} component={ProductDetail} />
        <Route path={"/about"} component={About} />
        <Route path={"/how-rental-works"} component={HowRentalWorks} />
        <Route path={"/list-with-us"} component={ListWithUs} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/admin"} component={LazyAdminAccess} />
        <Route path={"/admin/dashboard"} component={LazyProtectedAdminRoute} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Analytics />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
