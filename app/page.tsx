export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">
          Overview and key metrics for architecture reviews.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">
          Dashboard content will appear here. Use the role switcher in the top-right to change your role.
        </p>
      </div>
    </div>
  );
}
