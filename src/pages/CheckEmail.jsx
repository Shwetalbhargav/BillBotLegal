import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/common";

const inboxUrl = (email) => {
  const domain = (email.split("@")[1] || "").toLowerCase();
  if (domain === "gmail.com") return "https://mail.google.com/mail/u/0/#inbox";
  if (domain.includes("outlook.") || ["hotmail.com","live.com"].includes(domain)) return "https://outlook.live.com/mail/";
  if (domain === "yahoo.com") return "https://mail.yahoo.com/";
  return `https://www.${domain}`;
};

export default function CheckEmail() {
  const { search } = useLocation();
  const email = useMemo(() => new URLSearchParams(search).get("email") || "", [search]);
  const link = inboxUrl(email);

  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-xl font-semibold mb-2">Check your email</h1>
        <p className="text-sm">We’ve sent a verification link to <b>{email}</b>.</p>
        <div className="mt-6 flex flex-col gap-3">
          <a href={link}><Button fullWidth>Open your inbox</Button></a>
          <Link className="underline" to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
