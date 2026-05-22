import { Suspense } from "react";
import { ResetForm } from "../../../components/auth/ResetForm";
import { AuthLayout } from "../../../components/auth/AuthLayout";

export const dynamic = "force-dynamic";

export default function ResetPage() {
  return (
    <AuthLayout
      title="Новый пароль"
      subtitle="Задайте новый пароль — старый перестанет работать сразу."
    >
      <Suspense fallback={<div>Загружаем...</div>}>
        <ResetForm />
      </Suspense>
    </AuthLayout>
  );
}
