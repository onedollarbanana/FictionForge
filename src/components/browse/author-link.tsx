"use client";

import Link from "next/link";

interface AuthorLinkProps {
  username: string;
}

export function AuthorLink({ username }: AuthorLinkProps) {
  return (
    <Link
      href={`/profile/${username}`}
      onClick={(e) => e.stopPropagation()}
      className="hover:text-foreground hover:underline"
    >
      {username}
    </Link>
  );
}
