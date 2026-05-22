import { Suspense } from "react";
import { CheckInbox } from "../../../components/auth/CheckInbox";
import { AuthLayout } from "../../../components/auth/AuthLayout";

export const dynamic = "force-dynamic";

export default function CheckInboxPage() {
  return (
    <AuthLayout
      title="Письмо отправлено"
      subtitle="Скоро придёт. Загляните в почту."
    >
      <Suspense fallback={<div>Загружаем...</div>}>
        <CheckInbox />
      </Suspense>
    </AuthLayout>
  );
}
