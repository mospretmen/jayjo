import { lazy, Suspense, type ComponentType } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { RouteError } from "@/components/errors/RouteError";
import { PageSkeleton } from "@/components/layout/PageSkeleton";

const Home = lazy(() => import("@/routes/Home"));
const Shop = lazy(() => import("@/routes/Shop"));
const ArtworkDetail = lazy(() => import("@/routes/ArtworkDetail"));
const Galleries = lazy(() => import("@/routes/Galleries"));
const GalleryDetail = lazy(() => import("@/routes/GalleryDetail"));
const Favorites = lazy(() => import("@/routes/Favorites"));
const About = lazy(() => import("@/routes/About"));
const WorkWithUs = lazy(() => import("@/routes/WorkWithUs"));
const NotFound = lazy(() => import("@/routes/NotFound"));

function wrap(Component: ComponentType) {
  return (
    <ErrorBoundary fallback={(err, reset) => <RouteError error={err} reset={reset} />}>
      <Suspense fallback={<PageSkeleton />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: wrap(Home) },
      { path: "/shop", element: wrap(Shop) },
      { path: "/shop/:slug", element: wrap(ArtworkDetail) },
      { path: "/galleries", element: wrap(Galleries) },
      { path: "/galleries/:slug", element: wrap(GalleryDetail) },
      { path: "/favorites", element: wrap(Favorites) },
      { path: "/about", element: wrap(About) },
      { path: "/work-with-us", element: wrap(WorkWithUs) },
      { path: "/cart", element: wrap(NotFound) /* wired in Plan 2 */ },
      { path: "*", element: wrap(NotFound) },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
