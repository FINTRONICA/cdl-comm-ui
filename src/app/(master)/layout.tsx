"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TablePageLayout } from "@/components/templates/TablePageLayout";
import { Tab } from "@/types/activities";
import { useSidebarLabels } from "@/hooks/useSidebarLabels";
import { SidebarLabelsService } from "@/services/api/sidebarLabelsService";
import { useAppStore } from "@/store";
import { stripBasePath } from "@/utils/basePath";

const TAB_ROUTES: Record<string, string> = {
  customer: "/master/party",
  account: "/master/account-purpose",
  investment: "/master/investment",
  segment: "/master/business-segment",
  subSegment: "/master/business-sub-segment",
  dealType: "/master/agreement-Type",
  dealSubType: "/master/agreement-sub-type",
  product: "/master/product",
  dealSegment: "/master/agreement-segment",
  ledgerAccount: "/master/general-ledger-account",
  beneficiary: "/master/beneficiary",
  countryCode: "/master/country",
  currencyCode: "/master/currency",
};

const ROUTE_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_ROUTES).map(([tabId, route]) => [route, tabId])
);

const TAB_CONFIG: Array<{
  id: string;
  sidebarId: string;
  fallbackLabel: string;
}> = [
    { id: "customer", sidebarId: "Party", fallbackLabel: "Party" },
    { id: "account", sidebarId: "AccountPurpose", fallbackLabel: "Account" },
    {
      id: "investment",
      sidebarId: "InvestmentType",
      fallbackLabel: "Investment ",
    },
    { id: "segment", sidebarId: "BusinessSegment", fallbackLabel: "Business " },
    {
      id: "subSegment",
      sidebarId: "BusinessSubSegment",
      fallbackLabel: "Sub Business  ",
    },
    {
      id: "dealType",
      sidebarId: "AgreementType",
      fallbackLabel: "Agreement Type",
    },
    {
      id: "dealSubType",
      sidebarId: "AgreementSubType",
      fallbackLabel: "Sub Agreement",
    },
    { id: "product", sidebarId: "ProductProgram", fallbackLabel: "Product" },
    {
      id: "dealSegment",
      sidebarId: "AgreementSegment",
      fallbackLabel: "Agreement",
    },
    {
      id: "ledgerAccount",
      sidebarId: "GeneralLedgerAccount",
      fallbackLabel: "General  Account",
    },
    { id: "beneficiary", sidebarId: "Beneficiary", fallbackLabel: "Beneficiary" },
    { id: "countryCode", sidebarId: "Country", fallbackLabel: "Country " },
    { id: "currencyCode", sidebarId: "Currency", fallbackLabel: "Currency " },
  ];

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const fullPathname = usePathname();
  const pathname = stripBasePath(fullPathname);
  const { data: sidebarLabels } = useSidebarLabels();
  const currentLanguage = useAppStore((state) => state.language);

  const activeTab = useMemo(() => {
    const normalizedPathname = pathname.replace(/\/$/, "");

    if (normalizedPathname.startsWith("/payment/")) {
      return null;
    }

    for (const [route, tabId] of Object.entries(ROUTE_TO_TAB)) {
      const normalizedRoute = route.replace(/\/$/, "");
      if (
        normalizedPathname === normalizedRoute ||
        normalizedPathname.startsWith(normalizedRoute + "/")
      ) {
        return tabId;
      }
    }

    return TAB_CONFIG[0]?.id || "customer";
  }, [pathname]);

  const getTabLabel = useCallback(
    (sidebarId: string, fallback: string): string => {
      if (sidebarLabels && SidebarLabelsService.hasLabels(sidebarLabels)) {
        return SidebarLabelsService.getLabelBySidebarId(
          sidebarLabels,
          sidebarId,
          currentLanguage,
          fallback
        );
      }
      return fallback;
    },
    [sidebarLabels, currentLanguage]
  );

  // Create tabs with labels
  const tabs: Tab[] = useMemo(() => {
    return TAB_CONFIG.map(({ id, sidebarId, fallbackLabel }) => {
      return {
        id,
        label: getTabLabel(sidebarId, fallbackLabel),
      };
    });
  }, [getTabLabel]);

  useEffect(() => {
    const prefetchRoutes = async () => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => {
          Object.values(TAB_ROUTES).forEach((route) => {
            router.prefetch(route);
          });
        });
      } else {
        setTimeout(() => {
          Object.values(TAB_ROUTES).forEach((route) => {
            router.prefetch(route);
          });
        }, 100);
      }
    };
    prefetchRoutes();
  }, [router]);

  const handleTabChange = useCallback(
    (tabId: string) => {
      const route = TAB_ROUTES[tabId];
      if (route && route !== pathname) {
        router.replace(route);
      }
    },
    [router, pathname]
  );

  const activeTabLabel = useMemo(() => {
    const tab = TAB_CONFIG.find((t) => t.id === activeTab);
    return tab ? getTabLabel(tab.sidebarId, tab.fallbackLabel) : "Master";
  }, [activeTab, getTabLabel]);

  useEffect(() => {
    if (pathname === "/master" || pathname === "/masters") {
      const defaultTabId = TAB_CONFIG[0]?.id || "customer";
      const defaultRoute = TAB_ROUTES[defaultTabId] ?? "/master/party";
      router.replace(defaultRoute);
    }
  }, [pathname, router]);

  if (pathname.startsWith("/payment/")) {
    return <>{children}</>;
  }

  return (
    <TablePageLayout
      title={`Master : ${activeTabLabel}`}
      tabs={tabs}
      activeTab={activeTab || TAB_CONFIG[0]?.id || "customer"}
      onTabChange={handleTabChange}
    >
      {children}
    </TablePageLayout>
  );
}
