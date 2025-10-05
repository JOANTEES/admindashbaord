"use client";

import * as React from "react";
import {
  IconDashboard,
  IconShirt,
  IconCalendar,
  IconEdit,
  IconSettings,
  IconUsers,
  IconCreditCard,
  IconUsersGroup,
  IconMapPin,
  IconPackage,
  IconBuildingStore,
  IconTag,
  IconCategory,
  IconChartBar,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Clothes",
      url: "/clothes",
      icon: IconShirt,
    },
    {
      title: "Brands",
      url: "/brands",
      icon: IconTag,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: IconCategory,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: IconChartBar,
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: IconCalendar,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: IconUsers,
    },
    {
      title: "Payments",
      url: "/payments",
      icon: IconCreditCard,
    },
    {
      title: "Delivery Zones",
      url: "/delivery-zones",
      icon: IconMapPin,
    },
    {
      title: "Pickup Locations",
      url: "/pickup-locations",
      icon: IconBuildingStore,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: IconPackage,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Site Editor",
      url: "/site-editor",
      icon: IconEdit,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex h-(--header-height) shrink-0 items-center gap-2 border-b px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={24}
              height={24}
              className="object-contain"
            />
            <span className="text-base font-semibold">Admin Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>{/* User dropdown removed */}</SidebarFooter>
    </Sidebar>
  );
}
