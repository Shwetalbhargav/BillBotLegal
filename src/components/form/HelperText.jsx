// src/components/form/HelperText.jsx
import React from "react";


export default function HelperText({ id, children }) {
return (
<p id={id} className="m-0 text-[12px] text-[color:var(--lb-muted)]">
{children}
</p>
);
}