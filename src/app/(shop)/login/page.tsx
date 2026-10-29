import type { Metadata } from "next";
import { LoginView } from "./LoginView";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return <LoginView />;
}
