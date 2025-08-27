import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, ToastProvider, useToast } from "@/components/common";
import { Input, Switch } from "@/components/form";
import Form from "@/components/form/Form";
import FormField from "@/components/form/FormField";
import { useForm } from "react-hook-form";
import lawyer from "@/assets/lawyer.jpg";
import { requestMagicLink } from "@/services/api";
export default function Login() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const form = useForm({ mode: "onBlur", defaultValues: { email: "", remember: true } })
  const [submitting, setSubmitting] = useState(false);
  

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await requestMagicLink({ email: values.email });
      addToast({ tone: "success", title: "Sign-in link sent" });
      navigate(`/check-email?email=${encodeURIComponent(values.email)}`);
      
    } catch (e) {
      addToast({ tone: "danger", title: "Couldn’t send link", description: "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

 
   return (
  <div
    className="relative min-h-screen bg-cover bg-center"
    style={{ backgroundImage: `url(${lawyer})` }}
  >
    {/* soft dark overlay for readability */}
    <div className="absolute inset-0 bg-black/40" />

    {/* content */}
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-10">
        {/* Left — branding */}
        <div className="max-w-xl text-white text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight drop-shadow-lg">
            Log every billable minute
          </h1>
          <p className="mt-3 text-base md:text-xl text-white/90 drop-shadow">
            Email time tracking + GPT summaries + one‑click push to Clio.
          </p>
        </div>

        {/* Right — form (glass / transparent) */}
        <div className="w-full max-w-md bg-white/15 backdrop-blur-md border border-white/30 shadow-2xl rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-900/90">Email me a sign-in link</h2>

          <Form form={form} onSubmit={onSubmit} className="space-y-4">
            <FormField name="email" label="Email" required>
              {({ id, describedBy, error }) => (
                <Input
                  id={id}
                  type="email"
                  aria-describedby={describedBy}
                  aria-invalid={!!error}
                  placeholder="you@firm.com"
                  {...form.register("email", { required: "Email is required" })}
                />
              )}
            </FormField>
              <Button type="submit" loading={submitting} fullWidth>
           Send sign-in link          </Button>
            

          </Form>

          
          
        </div>
      </div>
    </div>
  </div>
)};
