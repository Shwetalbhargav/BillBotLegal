// src/components/common/ConfirmDialog.jsx
import React from "react";
import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // Button variant for confirm
  onCancel,
  onConfirm,
  preventCloseOnBackdrop = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      preventCloseOnBackdrop={preventCloseOnBackdrop}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={variant} size="sm" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="m-0 text-[color:var(--lb-muted)] text-[14px] leading-6">
        {description}
      </p>
    </Modal>
  );
}
