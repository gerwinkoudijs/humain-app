import { Suspense } from "react";

import { Humain } from "@/features/humain/humain";

export default function Home() {
  return (
    <Suspense>
      <Humain />
    </Suspense>
  );
}
