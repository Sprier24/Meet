import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/ModeToggle"
import { Breadcrumb, BreadcrumbSeparator, BreadcrumbPage, BreadcrumbList, BreadcrumbLink, BreadcrumbItem } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Settings } from "lucide-react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { MongoClient } from 'mongodb';
import DashboardGrid from "./DashboardGrid"

const MONGODB_URI = "mongodb+srv://Eons:abcd1234@cluster0.4hb7y4t.mongodb.net/certificateDB";

export default async function Page() {
  let certificateCount = 0;
  let serviceCount = 0;
  let client;

  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('certificateDB');

    // Get counts from MongoDB
    // Collection names in MongoDB are lowercase plural of the model names
    certificateCount = await db.collection('certificates').countDocuments();
    serviceCount = await db.collection('services').countDocuments();
    console.log('Connected to database:', db.databaseName);
    console.log('Counts:', { certificateCount, serviceCount });
  } catch (error) {
    console.error('Database error:', error);
    // Keep default values of 0 for counts
  } finally {
    if (client) {
      await client.close();
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <ModeToggle />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* <DashboardGrid certificateCount={certificateCount} serviceCount={serviceCount} /> */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Certificates
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{certificateCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Services
                </CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{serviceCount || 0}</div>
              </CardContent>
            </Card>
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            <DashboardGrid />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
