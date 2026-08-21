import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import SimulatorPage from '@/pages/simulator';
import LandingOfferPage from '@/pages/landing-offer';
import AdminPage from '@/pages/admin';
import ClientDemoCrmPage from '@/pages/client-demo-crm';
import { Route, Switch, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/simulator" component={SimulatorPage} />
      <Route path="/demo/:hash/crm" component={ClientDemoCrmPage} />
      <Route path="/demo/:hash">{(params) => <SimulatorPage initialSlug={params.hash} isDemoRoute={true} />}</Route>
      <Route path="/chat/:slug">{(params) => <SimulatorPage initialSlug={params.slug} />}</Route>
      <Route path="/admin" component={AdminPage} />
      <Route path="/" component={LandingOfferPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
