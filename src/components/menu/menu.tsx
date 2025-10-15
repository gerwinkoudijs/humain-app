"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { name: "Yourstyle AI", path: "/" },
  //{ name: "Settings", path: "/settings" },
];

export const Menu = () => {
  const path = usePathname();

  return (
    <div className="flex w-full items-start justify-between px-[12px] sm:px-[24px] py-[24px]">
      <div className="flex justify-start mr-[18px] gap-[24px] font-normal tracking-tight text-primary text-[24px] mt-[-8px]">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={path.startsWith(item.path) ? "font-bold" : ""}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="font-extrabold tracking-tight text-primary text-[48px]/[48px] mt-[-8px]">
        Yourstyle AI
      </div>
    </div>
  );
};
