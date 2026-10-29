"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, IconLink, Tabs, TextInput } from "@/components/ui";
import { AppBar } from "@/components/shop/AppBar";
import { Wordmark } from "@/components/shop/Logo";
import { PageTransition } from "@/components/shop/PageTransition";
import { demoUser } from "@/lib/data";
import { useShop } from "@/lib/store";
import s from "./login.module.css";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function LoginView() {
  const router = useRouter();
  const { t, login } = useShop();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [tried, setTried] = useState(false);
  const value = email.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const error = !tried ? undefined : value.length === 0 ? t.required : !valid ? t.errEmail : undefined;

  const done = () => {
    login({ ...demoUser, email: valid ? value : demoUser.email });
    router.push("/profile");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (valid) done();
  };

  return (
    <div className={s.page}>
      <AppBar
        mobileOnly={false}
        leading={<IconLink href="/" icon="close" label={t.close} />}
        center={
          <Link href="/" className={`wordmark ${s.mark}`}>
            <Wordmark name={t.shop} />
          </Link>
        }
        end={<span style={{ width: 44 }} />}
      />
      <PageTransition>
        <main className={s.main}>
          <div className={s.card}>
            <Tabs
              label={t.login}
              value={tab}
              onChange={setTab}
              tabs={[
                { id: "login", label: t.login },
                { id: "signup", label: t.signup },
              ]}
            />
            <div className={s.intro}>
              <h1 className="headline">{tab === "login" ? t.welcome : t.create}</h1>
              <p className="body muted">{tab === "login" ? t.welcomeText : t.createText}</p>
            </div>
            <form onSubmit={submit} noValidate className={s.form}>
              <TextInput label={t.email} required type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
              <Button type="submit" fullWidth>
                {t.continue}
              </Button>
            </form>
            <div className="or-divider small">{t.or}</div>
            <div className={s.alt}>
              <button type="button" className="at-btn at-btn--secondary at-btn--full" onClick={done}>
                <GoogleMark />
                <span>{t.google}</span>
              </button>
            </div>
            <p className={`small muted ${s.terms}`}>{t.terms}</p>
          </div>
        </main>
      </PageTransition>
    </div>
  );
}
