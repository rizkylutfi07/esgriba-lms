import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

export default function Dashboard01() {
  const sampleRows = [
    {
      id: 1,
      header: "Executive Summary",
      type: "Executive Summary",
      status: "Done",
      target: "10",
      limit: "20",
      reviewer: "Assign reviewer",
    },
    {
      id: 2,
      header: "Technical Approach",
      type: "Technical Approach",
      status: "In Progress",
      target: "5",
      limit: "15",
      reviewer: "Assign reviewer",
    },
  ];
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <SiteHeader />
        <div className="container mx-auto p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here's an overview of your data.
              </p>
            </div>
          </div>

          {/* Section Cards */}
          <SectionCards />

          {/* Tabs Section */}
          <Tabs defaultValue="outline" className="space-y-4">
            <TabsList>
              <TabsTrigger value="outline">Outline</TabsTrigger>
              <TabsTrigger value="past-performance">
                Past Performance
              </TabsTrigger>
              <TabsTrigger value="key-personnel">Key Personnel</TabsTrigger>
              <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="outline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Visitors</CardTitle>
                  <CardDescription>Total for the last 3 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartAreaInteractive />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="past-performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Past Performance</CardTitle>
                  <CardDescription>Historical data and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Past performance data will be displayed here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="key-personnel" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Key Personnel</CardTitle>
                  <CardDescription>Team members and roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable data={sampleRows as any} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="focus-documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Focus Documents</CardTitle>
                  <CardDescription>
                    Important documents and files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Document list will be displayed here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </SidebarProvider>
  );
}
