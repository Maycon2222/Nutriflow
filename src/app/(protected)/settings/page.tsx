import { Card } from "@/components/ui/card";
import { AccountForm } from "@/components/settings/account-form";
import { requireCurrentUser } from "@/services/session-service";

export default async function SettingsPage() {
  const user = await requireCurrentUser();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações da conta</h1>
        <p className="text-sm text-slate-500">Área preparada para preferências, tema, notificações e integrações.</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Dados da nutricionista</h2>
        <p className="mt-1 text-sm text-slate-500">Atualize seus dados sem sair da plataforma.</p>
        <div className="mt-4">
          <AccountForm name={user.name} email={user.email} />
        </div>
      </Card>
    </div>
  );
}
