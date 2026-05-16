import clsx from "clsx";
import { ReactNode } from "react";


interface Props {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className }: Props) {
  return (
    <div
      className={clsx(
        "w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-[1920px] 2xl:mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}