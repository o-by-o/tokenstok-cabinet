import { Suspense } from "react";
import { MagicLinkConsume } from "../../../components/auth/MagicLinkConsume";
import { AuthLayout } from "../../../components/auth/AuthLayout";

export const dynamic = "force-dynamic";

export default function MagicPage() {
  return (
    <AuthLayout
      title="Вход по ссылке"
      subtitle="Одноразовая ссылка из почты. Никаких паролей — просто заходи."
    >
      <Suspense fallback={<div>Загружаем...</div>}>
        <MagicLinkConsume />
      </Suspense>
    </AuthLayout>
  );
}
