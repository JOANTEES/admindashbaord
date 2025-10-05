"use client";

import { useMemo, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconSearch, IconEye, IconEdit, IconLoader } from "@tabler/icons-react";
import { ProtectedRoute } from "@/components/protected-route";
import UsersPage from "../users/page";

// Customers page delegates to the unified customers list (filtered in users/page.tsx)
export default function CustomersPage() {
  return <UsersPage />;
}
