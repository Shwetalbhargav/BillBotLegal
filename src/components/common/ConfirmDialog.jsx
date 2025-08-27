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
        <>
          <Button variant="secondary" onClick={onCancel}>{cancelText}</Button>
          <Button variant={variant} onClick={onConfirm}>{confirmText}</Button>
        </>
      }
    >
      <p className="m-0 text-[color:var(--lb-muted)]">{description}</p>
    </Modal>
  );
}
