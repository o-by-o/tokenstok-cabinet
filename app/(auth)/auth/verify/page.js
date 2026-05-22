import { Suspense } from "react";
import { VerifyConsume } from "../../../components/auth/VerifyConsume";
import { AuthLayout } from "../../../components/auth/AuthLayout";

export const dynamic = "force-dynamic";

export default function VerifyPage() {
  return (
    <AuthLayout
      title="Подтверждение"
      subtitle="Проверяем подлинность email и активируем аккаунт."
    >
      <Suspense fallback={<div>Загружаем...</div>}>
        <VerifyConsume />
      </Suspense>
    </AuthLayout>
  );
}
