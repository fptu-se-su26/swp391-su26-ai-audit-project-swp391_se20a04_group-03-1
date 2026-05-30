"use client";

import React from "react";
import { Button } from "./Button";
import { Bell } from 'lucide-react-native';

export default function Snackbar({
  open,
  message,
  undo,
  onClose,
}: {
  open: boolean;
  message: string;
  undo?: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed left-1/2 bottom-6 z-50 w-full max-w-md -translate-x-1/2">
      <div className="mx-4 flex items-center justify-between gap-4 rounded-lg border bg-[#101b31]/95 p-3 shadow-lg transform transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-white/5 flex items-center justify-center text-amber-300">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold">{message}</p>
            <p className="text-xs text-slate-400">
              Hoàn tác sẽ khôi phục trạng thái trước đó.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {undo && (
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                undo();
                onClose();
              }}
            >
              Hoàn tác
            </Button>
          )}
          <Button variant="ghost" size="sm" onPress={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
