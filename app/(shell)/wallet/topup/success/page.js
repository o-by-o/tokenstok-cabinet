import { Suspense } from "react";
import { TopupResult } from "../../../../components/wallet/TopupResult";

export const dynamic = "force-dynamic";

export default function TopupSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Проверяем оплату...</div>}>
      <TopupResult kind="success" />
    </Suspense>
  );
}
