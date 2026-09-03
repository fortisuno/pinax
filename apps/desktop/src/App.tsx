import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { EvaluationSync } from "@/components/students/evaluation-sync"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { EvaluationProvider } from "@/stores/evaluation-store"
import { StudentsProvider } from "@/stores/students-store"

function App() {
  return (
    <TooltipProvider>
      <EvaluationProvider>
        <StudentsProvider>
          <EvaluationSync />
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
              {/* <SiteHeader /> */}
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <DataTable />
                  </div>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </StudentsProvider>
      </EvaluationProvider>
    </TooltipProvider>
  )
}

export default App
