import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Listings } from "./pages/Listings";
import { ListingDetail } from "./pages/ListingDetail";
import { Profile } from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/listings",
    Component: Listings,
  },
  {
    path: "/listings/:id",
    Component: ListingDetail,
  },
  {
    path: "/profile",
    Component: Profile,
  },
]);
