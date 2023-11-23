import React from "react";
import Image from "next/image";
import LineLogo from "@/asset/line_64.png";

type LineButtonProps = {
  btnProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  text: string;
};
export default function LineButton({ btnProps, text }: LineButtonProps) {
  return (
    <button
      {...btnProps}
      className="w-full flex text-white bg-[#06C755] rounded active:[&>div]:bg-black active:[&>div]:bg-opacity-30"
    >
      <div className="flex flex-row w-full h-full rounded hover:bg-black hover:bg-opacity-10">
        <div className="flex h-12 w-12 border-r-2 border-black border-opacity-[0.08]">
          <Image src={LineLogo} alt="Line logo" />
        </div>
        <span className="self-center flex-grow">{text}</span>
      </div>
    </button>
  );
}
