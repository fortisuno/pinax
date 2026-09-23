import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import { Separator } from "./ui/separator";

export function SiteHeader() {
  return (
    <header className="flex min-h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-4 lg:px-6">
        {/* <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        /> */}
        <Item variant="default" className="w-auto">
          <ItemContent className="flex flex-row gap-3">
            <ItemTitle>Ciclo Escolar</ItemTitle>
            <ItemDescription>2023-2024</ItemDescription>
          </ItemContent>
        </Item>
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <Item variant="default" className="w-auto">
          <ItemContent className="flex flex-row gap-3">
            <ItemTitle>Grado</ItemTitle>
            <ItemDescription>6°</ItemDescription>
          </ItemContent>
        </Item>
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <Item variant="default" className="w-auto">
          <ItemContent className="flex flex-row gap-3">
            <ItemTitle>Grupo</ItemTitle>
            <ItemDescription>A</ItemDescription>
          </ItemContent>
        </Item>
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <Item variant="default" className="w-auto">
          <ItemContent className="flex flex-row gap-3">
            <ItemTitle>Periodo</ItemTitle>
            <ItemDescription>1/3</ItemDescription>
          </ItemContent>
        </Item>
      </div>
    </header>
  )
}
