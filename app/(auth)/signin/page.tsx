// app/(auth)/signin/page.tsx
import { Suspense } from "react";
import SignInClient from "./SignInClient";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading sign-in form...</div>}>
      <SignInClient />
    </Suspense>
  );
}
