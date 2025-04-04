import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import GoogleDriveClone from "./card"

import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button" 


export default function CertificatePage() {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4 w-full">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator orientation="vertical" className="mr-2 h-4"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">    
                                    <BreadcrumbLink href="/dashboard">
                                        Dashboard
                                    </BreadcrumbLink>
                                    <BreadcrumbLink href="/document">
                                   
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                
                            </BreadcrumbList>
                        </Breadcrumb>
                        {/* Add button in the header */}
                        <div className="ml-auto">
                            <Button>Deal List</Button>
                        </div>
                    </div>
                </header>
                <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15 ">
                    
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-center"> </CardTitle>
                            <CardDescription className="text-center">
                                
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GoogleDriveClone/>
                        </CardContent>
                    
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
