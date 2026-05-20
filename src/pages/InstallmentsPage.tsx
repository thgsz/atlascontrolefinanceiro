import { DashboardLayout } from '@/components/atlas/DashboardLayout';
import { InstallmentsModule } from '@/components/atlas/modules/InstallmentsModule';

export default function InstallmentsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Parcelas</h1>
        <p className="text-muted-foreground">
          Acompanhe suas compras parceladas e pagamentos futuros
        </p>
      </div>

      <div className="mb-8">
        <InstallmentsModule />
      </div>
    </DashboardLayout>
  );
}
