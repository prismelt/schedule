"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "~/styles/day-modal.module.css";
import { api } from "~/trpc/react";

function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/kid/view", label: "My Requests", roles: ["kid"] },
    { href: "/tutor/post", label: "All Requests", roles: ["tutor"] },
    { href: "/tutor/view", label: "My Responses", roles: ["tutor"] },
    { href: "/settings", label: "Settings", roles: ["kid", "tutor"] },
  ];

  // Determine current role based on pathname
  const { data: userType } = api.user.getUserType.useQuery();
  const currentRole = userType ?? "kid"; // fake value that will not be used

  const filteredNavItems = navItems.filter(
    (item) => item.roles.includes(currentRole) || item.roles.includes("both"),
  );

  return (
    <nav className={styles.navigation}>
      {filteredNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navButton} ${pathname === item.href ? styles.active : ""}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default Navigation;
