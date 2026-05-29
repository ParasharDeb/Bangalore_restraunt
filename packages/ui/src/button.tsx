"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  clickhandler:()=>void
}

export const Button = ({ children,clickhandler}: ButtonProps) => {
  return (
    <button
      className="px-5 py-2 border-2 border-[#ff7a27] text-[#ff7a27] rounded-full font-semibold hover:bg-[#ff7a27] hover:text-white transition cursor-pointer w-full mt-7"
      onClick={clickhandler}
    
    >
      {children}
    </button>
  );
};
