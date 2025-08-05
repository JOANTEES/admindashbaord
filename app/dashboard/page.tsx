import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  IconUsers, 
  IconShoppingCart, 
  IconUserPlus, 
  IconCalendar, 
  IconShirt 
} from "@tabler/icons-react"

export default function Page() {
  const stats = [
    {
      title: "Total Site Visitors",
      value: "2,153",
      icon: IconUsers,
      description: "Total visitors this month",
    },
    {
      title: "Purchases",
      value: "123",
      icon: IconShoppingCart,
      description: "Total purchases made",
    },
    {
      title: "User Signups",
      value: "456",
      icon: IconUserPlus,
      description: "New user registrations",
    },
    {
      title: "Bookings",
      value: "78",
      icon: IconCalendar,
      description: "Active bookings",
    },
    {
      title: "Clothes Uploaded",
      value: "34",
      icon: IconShirt,
      description: "Items in inventory",
    },
  ]

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-3xl font-bold text-foreground mb-6">Dashboard Overview</h1>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {stats.map((stat, index) => (
                    <Card key={index} className="border-2 hover:border-primary transition-colors">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stat.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Welcome Card */}
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <IconUsers className="h-6 w-6 text-background" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Welcome to Admin Dashboard
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Manage your clothes, bookings, and site content from one place.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 