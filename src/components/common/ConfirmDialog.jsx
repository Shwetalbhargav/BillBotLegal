import React from "react";
import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
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
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onCancel}>{cancelText}</Button>
          <Button variant={variant} onClick={onConfirm}>{confirmText}</Button>
        </div>
      }
    >
      <p className="m-0 text-[color:var(--lb-muted)] text-[14px] leading-6">{description}</p>
    </Modal>
  );
}