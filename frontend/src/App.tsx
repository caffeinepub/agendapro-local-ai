import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { AppLayout } from '@/components/AppLayout';
import { AgendaPage } from '@/pages/AgendaPage';
import { ClientsPage } from '@/pages/ClientsPage';
import { FinancialsPage } from '@/pages/FinancialsPage';
import { RetentionPage } from '@/pages/RetentionPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { RemindersPage } from '@/pages/RemindersPage';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' });
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const agendaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agenda',
  component: AgendaPage,
});

const clientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients',
  component: ClientsPage,
});

const financialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/financials',
  component: FinancialsPage,
});

const retentionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/retention',
  component: RetentionPage,
});

const remindersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reminders',
  component: RemindersPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  agendaRoute,
  clientsRoute,
  financialsRoute,
  retentionRoute,
  remindersRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
