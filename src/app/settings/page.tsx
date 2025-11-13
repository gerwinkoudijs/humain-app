import { Suspense } from "react";
import { Profile } from "@/features/settings/profile";

export default function SettingsPage() {
  return (
    <Suspense>
      <Profile />
    </Suspense>
  );
}
