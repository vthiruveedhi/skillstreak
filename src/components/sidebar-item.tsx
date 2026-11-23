"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  Icon: LucideIcon;
  href: string;
};

export const SidebarItem = ({ label, Icon, href }: Props) => {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Button
      variant={active ? "sidebarOutline" : "sidebar"}
      className="justify-start h-[52px]"
      asChild
    >
      <Link href={href}>
        <Icon className="mr-5 w-5 h-5" />
        {label}
      </Link>
    </Button>
  );
};
