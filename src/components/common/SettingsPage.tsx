"use client";

import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "./PageHeader";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const user = useCurrentUser();

  return (
    <>
      <PageHeader title="Settings" description="Manage your account and security." />
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal information</CardTitle>
              <CardDescription>Your account details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" defaultValue={user?.name ?? ""} />
              <Field label="Email" defaultValue={user?.email ?? ""} />
              <Field label="Mobile" defaultValue={user?.mobile ?? ""} />
              <Field label="Role" defaultValue={user?.role ?? ""} disabled />
              <div className="sm:col-span-2 flex justify-end">
                <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="grid gap-4 lg:grid-cols-2">
          <ChangePassword />
          <ChangePin />
        </TabsContent>
      </Tabs>
    </>
  );
}

function Field({
  label,
  defaultValue,
  disabled,
}: {
  label: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} disabled={disabled} />
    </div>
  );
}

/** Password/PIN input with a show/hide eye toggle. */
function SecretInput({
  value,
  onChange,
  placeholder,
  inputMode,
  maxLength,
  invalid,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputMode?: "numeric" | "text";
  maxLength?: number;
  invalid?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className={cn("pr-10", invalid && "border-destructive")}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={show ? "Hide" : "Show"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && next !== confirm;

  const submit = () => {
    if (next.length < 6) return toast.error("New password must be at least 6 characters");
    if (next !== confirm) return toast.error("Passwords do not match");
    toast.success("Password updated");
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="h-4 w-4" /> Change Password
        </CardTitle>
        <CardDescription>Use at least 6 characters.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label>Current password</Label>
          <SecretInput value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••" />
        </div>
        <div className="space-y-1.5">
          <Label>New password</Label>
          <SecretInput value={next} onChange={(e) => setNext(e.target.value)} placeholder="••••••••" />
        </div>
        <div className="space-y-1.5">
          <Label>Confirm password</Label>
          <SecretInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            invalid={mismatch}
          />
          {mismatch && <p className="text-xs text-destructive">Passwords do not match.</p>}
        </div>
        <div className="flex justify-end pt-1">
          <Button onClick={submit} disabled={!next || !confirm || mismatch}>
            Update Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChangePin() {
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && next !== confirm;
  const onlyDigits = (v: string) => v.replace(/\D/g, "").slice(0, 6);

  const submit = () => {
    if (next.length < 4) return toast.error("PIN must be at least 4 digits");
    if (next !== confirm) return toast.error("PINs do not match");
    toast.success("PIN updated");
    setNext("");
    setConfirm("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="h-4 w-4" /> Change PIN
        </CardTitle>
        <CardDescription>4–6 digit numeric PIN for quick sign-in.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label>New PIN</Label>
          <SecretInput
            value={next}
            onChange={(e) => setNext(onlyDigits(e.target.value))}
            placeholder="••••"
            inputMode="numeric"
            maxLength={6}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Confirm PIN</Label>
          <SecretInput
            value={confirm}
            onChange={(e) => setConfirm(onlyDigits(e.target.value))}
            placeholder="••••"
            inputMode="numeric"
            maxLength={6}
            invalid={mismatch}
          />
          {mismatch && <p className="text-xs text-destructive">PINs do not match.</p>}
        </div>
        <div className="flex justify-end pt-1">
          <Button onClick={submit} disabled={!next || !confirm || mismatch}>
            Update PIN
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
