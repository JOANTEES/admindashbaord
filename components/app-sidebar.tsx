"use client";

import * as React from "react";
import {
  IconDashboard,
  IconShirt,
  IconCalendar,
  IconEdit,
  IconSettings,
  IconHelp,
  IconSearch,
  IconUsers,
  IconCreditCard,
  IconUsersGroup,
  IconMapPin,
  IconPackage,
  IconBuildingStore,
  IconTag,
  IconCategory,
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
      title: "Bookings",
      url: "/bookings",
      icon: IconCalendar,
    },
    {
      title: "Users",
      url: "/users",
      icon: IconUsers,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: IconUsersGroup,
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
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-background font-bold text-lg">A</span>
                </div>
                <span className="text-base font-semibold">Admin Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{/* User dropdown removed */}</SidebarFooter>
    </Sidebar>
  );
}
