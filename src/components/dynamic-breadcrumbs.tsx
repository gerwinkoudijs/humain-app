"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";

// Route name mappings
const routeNameMap: Record<string, string> = {
  generate: "Genereer Social Post",
  settings: "Instellingen",
  admin: "Beheer",
  tenants: "Klantenbeheer",
  users: "Gebruikersbeheer",
  dashboard: "Dashboard",
  sessions: "Sessies",
  profile: "Profiel",
};

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const [tenantName, setTenantName] = useState<string | null>(null);

  // Extract tenant ID from pathname if present
  const tenantIdMatch = pathname.match(/\/admin\/tenants\/([^\/]+)/);
  const tenantId = tenantIdMatch ? tenantIdMatch[1] : null;

  // Fetch tenant data if we have a tenant ID
  const { data: tenant } = api.tenants.getTenant.useQuery(
    { id: tenantId! },
    { enabled: !!tenantId && tenantId.length === 36 } // Only fetch if valid UUID
  );

  useEffect(() => {
    if (tenant) {
      setTenantName(tenant.name);
    }
  }, [tenant]);

  // Split pathname and filter out empty strings
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  // If on root, show home breadcrumb
  if (pathSegments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Yourstyle AI</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Build breadcrumb items
  const breadcrumbItems = [];
  let currentPath = "";

  // Always add home
  breadcrumbItems.push(
    <BreadcrumbItem key="home" className="hidden md:block">
      <BreadcrumbLink href="/">Yourstyle AI</BreadcrumbLink>
    </BreadcrumbItem>
  );

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;

    // Check if segment is a UUID (likely an ID)
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment
      );

    let displayName: string;

    if (isUuid && tenantName) {
      // Use fetched tenant name
      displayName = tenantName;
    } else if (isUuid) {
      // Show loading or generic text for UUIDs
      displayName = "Details";
    } else {
      // Use mapped name or capitalize segment
      displayName =
        routeNameMap[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);
    }

    breadcrumbItems.push(
      <BreadcrumbSeparator key={`sep-${index}`} className="hidden md:block" />
    );

    if (isLast) {
      breadcrumbItems.push(
        <BreadcrumbItem key={segment}>
          <BreadcrumbPage>{displayName}</BreadcrumbPage>
        </BreadcrumbItem>
      );
    } else {
      breadcrumbItems.push(
        <BreadcrumbItem key={segment} className="hidden md:block">
          <BreadcrumbLink href={currentPath}>{displayName}</BreadcrumbLink>
        </BreadcrumbItem>
      );
    }
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
    </Breadcrumb>
  );
}
