import { Suspense } from "react";
import { TopupResult } from "../../../../components/wallet/TopupResult";

export const dynamic = "force-dynamic";

export default function TopupCancelPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>...</div>}>
      <TopupResult kind="cancel" />
    </Suspense>
  );
}
