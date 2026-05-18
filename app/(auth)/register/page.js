import { RegisterForm } from "../../components/auth/RegisterForm";
import { AuthLayout } from "../../components/auth/AuthLayout";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Заводи кошелёк."
      subtitle="100 ₽ на старт — наш подарок чтобы попробовать. Без карты, без подписок."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
