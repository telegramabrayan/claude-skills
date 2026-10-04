import type { AnchorHTMLAttributes, ReactNode } from "react";
import { navigate } from "./router";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode };

/** Reemplazo de next/link: navega por hash dentro de la misma página. */
export default function Link({ href, onClick, children, ...rest }: Props) {
  const external = /^https?:/.test(href);
  return (
    <a
      {...rest}
      href={external ? href : `#${href}`}
      onClick={(e) => {
        onClick?.(e);
        if (external || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
