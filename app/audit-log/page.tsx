export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Audit Log</h2>
        <p className="mt-1 text-sm text-slate-600">
          Activity and change history for compliance.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Audit log entries will appear here.</p>
      </div>
    </div>
  );
}
