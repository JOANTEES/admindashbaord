"use client";

import UsersPage from "../users/page";

// Customers page delegates to the unified customers list (filtered in users/page.tsx)
export default function CustomersPage() {
  return <UsersPage />;
}
