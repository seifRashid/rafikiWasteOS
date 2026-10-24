"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserMinus,
  UserCheck,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldAlert,
  Loader2,
  FileText,
  Truck,
  Users,
} from "lucide-react";
import { toggleClientStatusAction, deleteClientAction } from "@/server/actions/clients";

interface ClientLifecycleActionsProps {
  client: {
    id: string;
    name: string;
    accountNumber: string;
    isActive: boolean;
  };
  portalUsersCount?: number;
  jobsCount?: number;
  invoicesCount?: number;
}

export function ClientLifecycleActions({
  client,
  portalUsersCount = 0,
  jobsCount = 0,
  invoicesCount = 0,
}: ClientLifecycleActionsProps) {
  const router = useRouter();

  // Modals state
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form & Action states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Explicit confirmation string for deletion
  const [confirmInput, setConfirmInput] = useState("");

  // Handle Deactivate / Reactivate
  const handleToggleActive = async () => {
    setLoading(true);
    setError(null);
    try {
      const nextActiveState = !client.isActive;
      const res = await toggleClientStatusAction(client.id, nextActiveState);

      if (res.success) {
        setSuccessMessage(
          nextActiveState
            ? `Client "${client.name}" has been successfully reactivated.`
            : `Client "${client.name}" has been deactivated. Portal logins and routine schedules are paused.`
        );
        setTimeout(() => {
          setIsDeactivateOpen(false);
          setSuccessMessage(null);
          router.refresh();
        }, 1200);
      } else {
        setError(res.error || "Failed to update client status.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const isDeleteConfirmed =
    confirmInput.trim().toUpperCase() === "DELETE" ||
    confirmInput.trim().toLowerCase() === client.name.trim().toLowerCase();

  const handleDelete = async () => {
    if (!isDeleteConfirmed) return;

    setLoading(true);
    setError(null);
    try {
      const res = await deleteClientAction(client.id);

      if (res.success) {
        setSuccessMessage(`Client account "${client.name}" has been safely deleted.`);
        setTimeout(() => {
          setIsDeleteOpen(false);
          router.push("/clients");
          router.refresh();
        }, 1500);
      } else {
        setError(res.error || "Failed to delete client account.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Deactivate / Reactivate Action Button */}
        {client.isActive ? (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setSuccessMessage(null);
              setIsDeactivateOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-nested bg-white text-amber-700 hover:bg-amber-50 border border-amber-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Temporarily deactivate client and pause collections"
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Deactivate</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setSuccessMessage(null);
              setIsDeactivateOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-nested bg-[#EDF9F1] text-[#00682B] hover:bg-[#D3F3DE] border border-[#ADE4C1] text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Restore client account to active service"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Reactivate</span>
          </button>
        )}

        {/* Delete Client Action Button */}
        <button
          type="button"
          onClick={() => {
            setError(null);
            setSuccessMessage(null);
            setConfirmInput("");
            setIsDeleteOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-nested bg-white text-red-600 hover:bg-red-50 border border-red-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
          title="Permanently remove client account"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>

      {/* 1. Deactivate / Reactivate Confirmation Modal */}
      {isDeactivateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-card max-w-md w-full p-6 border border-[#E3E9E5] shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-nested flex items-center justify-center ${
                    client.isActive ? "bg-amber-50 text-amber-600" : "bg-[#EDF9F1] text-[#00993F]"
                  }`}
                >
                  {client.isActive ? (
                    <UserMinus className="w-5 h-5" />
                  ) : (
                    <UserCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {client.isActive ? "Deactivate Client Account" : "Reactivate Client Account"}
                  </h3>
                  <p className="text-[11px] text-[#4B5563] truncate max-w-[260px]">
                    {client.name} ({client.accountNumber})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeactivateOpen(false)}
                disabled={loading}
                className="text-[#9CA3AF] hover:text-slate-800 p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success notification */}
            {successMessage && (
              <div className="p-3 bg-[#EDF9F1] border border-[#ADE4C1] text-[#00682B] rounded-nested flex items-center gap-2 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error notification */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-nested flex items-center gap-2 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!successMessage && (
              <div className="space-y-3 text-xs text-[#4B5563]">
                <p>
                  {client.isActive ? (
                    <>
                      Are you sure you want to deactivate <strong>{client.name}</strong>?
                    </>
                  ) : (
                    <>
                      Reactivating <strong>{client.name}</strong> will restore their access to active waste collection operations.
                    </>
                  )}
                </p>

                <div className="p-3 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5] space-y-2 text-[11px]">
                  <span className="font-bold text-slate-800 block">Consequences & Safety Check:</span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                    <li>
                      <strong>Client Portal Logins:</strong>{" "}
                      {portalUsersCount > 0 ? (
                        <>
                          {portalUsersCount} associated login user{portalUsersCount > 1 ? "s" : ""} will be{" "}
                          {client.isActive ? "temporarily paused" : "restored"}.
                        </>
                      ) : (
                        "No portal logins are currently linked."
                      )}
                    </li>
                    <li>
                      <strong>Route Manifests:</strong> Recurring scheduled pickups will be{" "}
                      {client.isActive ? "excluded from daily dispatch" : "re-included on daily manifests"}.
                    </li>
                    <li>
                      <strong>Historical Records:</strong> All past weight tickets ({jobsCount} job{jobsCount !== 1 ? "s" : ""}) and invoices ({invoicesCount}) remain 100% preserved.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F4F2]">
              <button
                type="button"
                onClick={() => setIsDeactivateOpen(false)}
                disabled={loading}
                className="px-3 py-1.5 rounded-nested bg-white border border-[#E3E9E5] text-xs font-bold text-[#4B5563] hover:bg-[#F6F8F7] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={loading || Boolean(successMessage)}
                className={`px-4 py-1.5 rounded-nested text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  client.isActive
                    ? "bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
                    : "bg-[#00993F] text-white hover:bg-[#008235] shadow-sm"
                }`}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {client.isActive ? "Confirm Deactivation" : "Confirm Reactivation"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Delete Confirmation Modal (with Explicit Confirmation) */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-card max-w-lg w-full p-6 border border-[#E3E9E5] shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-nested bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Delete Client Account
                  </h3>
                  <p className="text-[11px] text-[#4B5563] truncate max-w-[280px]">
                    {client.name} ({client.accountNumber})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={loading}
                className="text-[#9CA3AF] hover:text-slate-800 p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success notification */}
            {successMessage && (
              <div className="p-3 bg-[#EDF9F1] border border-[#ADE4C1] text-[#00682B] rounded-nested flex items-center gap-2 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage} Redirecting to clients registry...</span>
              </div>
            )}

            {/* Error notification */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-nested flex items-center gap-2 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!successMessage && (
              <div className="space-y-3 text-xs text-[#4B5563]">
                <div className="p-3 rounded-nested bg-red-50/70 border border-red-200 text-red-800 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Warning: Irreversible Operational Action</span>
                  </div>
                  <p>
                    Deleting this client will remove them from active dispatch registries. Please review how related records are handled:
                  </p>
                </div>

                {/* Referential Integrity Audit Details */}
                <div className="grid grid-cols-3 gap-2 py-1 text-center">
                  <div className="p-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                    <Truck className="w-4 h-4 mx-auto text-[#00993F] mb-1" />
                    <span className="text-[10px] text-[#9CA3AF] block font-medium">Completed Jobs</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {jobsCount} Preserved
                    </span>
                  </div>
                  <div className="p-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                    <FileText className="w-4 h-4 mx-auto text-[#08A6BA] mb-1" />
                    <span className="text-[10px] text-[#9CA3AF] block font-medium">Past Invoices</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {invoicesCount} Preserved
                    </span>
                  </div>
                  <div className="p-2.5 rounded-nested bg-[#F6F8F7] border border-[#E3E9E5]">
                    <Users className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                    <span className="text-[10px] text-[#9CA3AF] block font-medium">Portal Logins</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {portalUsersCount} Revoked
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#4B5563] space-y-1">
                  <p>
                    • Historical weight data, weighbridge intake logs, and ESG landfill diversion certificates remain completely intact for compliance auditing.
                  </p>
                  <p>
                    • Any future scheduled/uncollected jobs for this client will be cancelled.
                  </p>
                </div>

                {/* Explicit confirmation requirement */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    To confirm deletion, type <span className="font-mono text-red-600">DELETE</span> or the client name below:
                  </label>
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder={`Type DELETE or "${client.name}"`}
                    disabled={loading}
                    className="w-full px-3 py-2 bg-white border border-[#E3E9E5] focus:border-red-500 rounded-nested text-xs font-medium outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F4F2]">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={loading}
                className="px-3 py-1.5 rounded-nested bg-white border border-[#E3E9E5] text-xs font-bold text-[#4B5563] hover:bg-[#F6F8F7] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!isDeleteConfirmed || loading || Boolean(successMessage)}
                className={`px-4 py-1.5 rounded-nested text-xs font-bold text-white transition-all flex items-center gap-1.5 ${
                  isDeleteConfirmed && !loading && !successMessage
                    ? "bg-red-600 hover:bg-red-700 shadow-sm cursor-pointer"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Permanently Delete Client</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
