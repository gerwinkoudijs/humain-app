import { Suspense } from "react";

import { FromUrl } from "@/features/from-url/from-url";

export default function Home() {
  return (
    <Suspense>
      <FromUrl />
    </Suspense>
  );
}
