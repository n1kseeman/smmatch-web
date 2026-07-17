import type { ReactNode } from "react";

import { MarketingFooter } from "@/widgets/marketing-footer";
import { MarketingHeader } from "@/widgets/marketing-header";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </>
  );
}
