import AdminDashboardView from "@/components/AdminDashboardView";
import AdminHeader from "@/components/AdminHeader";
import { getAdminDashboardData } from "@/lib/admin-dashboard";

export default async function AdminDashboard() {
  const dashboard = await getAdminDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <AdminHeader label="Dashboard" />
      </header>

      <AdminDashboardView dashboard={dashboard} />
    </div>
  );
}
