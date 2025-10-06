// src/components/form/Field.jsx
import React, { useId } from "react";
import { clsx } from "../../utils/clsx";


export default function Field({
label,
htmlFor,
required = false,
helper,
error,
className,
children,
}) {
const autoId = useId();
const id = htmlFor || autoId;
const helperId = `${id}-help`;
const errorId = `${id}-err`;


const describedBy = clsx(error && errorId, helper && helperId)
?.split(" ")
.filter(Boolean)
.join(" ");


return (
<div className={clsx("lb-reset flex flex-col gap-1", className)}>
{label && (
<label
htmlFor={id}
className="text-[color:var(--lb-text)] text-[var(--lb-fs-sm)] font-medium"
>
{label}
{required && <span className="text-[color:var(--lb-danger-600)]"> *</span>}
</label>
)}
{/* Clone child to inject id + aria wiring if input-like */}
{React.isValidElement(children)
? React.cloneElement(children, {
id,
...(describedBy ? { "aria-describedby": describedBy } : {}),
...(error ? { "aria-invalid": true } : {}),
})
: children}


{helper && !error && (
<p id={helperId} className="m-0 text-[color:var(--lb-muted)] text-[12px]">
{helper}
</p>
)}
{error && (
<p id={errorId} className="m-0 text-[color:var(--lb-danger-700)] text-[12px]">
{error}
</p>
)}
</div>
);
}