"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function AlertConfirm({
  open,
  title,
  description,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border bg-[#0f1a2a]/95 p-6 shadow-lg transition-transform duration-150">
        <h3 className="text-lg font-bold">{title ?? "Xác nhận"}</h3>
        {description && (
          <p className="mt-2 text-sm text-slate-300">{description}</p>
        )}
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
}
