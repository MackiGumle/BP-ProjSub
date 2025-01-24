import { Search } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar"
import { useSearchParams } from "react-router-dom"
import React from "react"
import { useDebouncedCallback } from "use-debounce";


export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = React.useState(searchParams.get("q") || "");

  // Adding debounce because it will be lagging :(
  const debouncedUpdate = useDebouncedCallback((value: string) => {
    const newParams = new URLSearchParams(searchParams);
    value ? newParams.set("q", value) : newParams.delete("q");
    setSearchParams(newParams, { replace: true });
  }, 300);

  // Update query param in URL on input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedUpdate(newQuery);
  }

  return (
    <form {...props} onSubmit={(e) => e.preventDefault()}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search assignments..."
            className="pl-8"
            value={query}
            onChange={handleSearch}
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
