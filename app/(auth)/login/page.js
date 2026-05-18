import { LoginForm } from "../../components/auth/LoginForm";
import { AuthLayout } from "../../components/auth/AuthLayout";

export default function LoginPage({ searchParams }) {
  return (
    <AuthLayout
      title="С возвращением."
      subtitle="218 моделей по одному ключу. Оплата по факту, без подписок."
    >
      <LoginForm searchParams={searchParams} />
    </AuthLayout>
  );
}
