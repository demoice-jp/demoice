import { useMemo } from "react";
import clsx from "clsx";
import Image from "next/image";
import z from "zod";
import NoImage from "@/asset/no_image.svg";

export const ImageSchema = z
  .object({
    src: z.string(),
    width: z.number(),
    height: z.number(),
  })
  .nullable();

export type ImageSchema = z.infer<typeof ImageSchema>;

type ContentImageProp = {
  contentImage: unknown;
  className?: string;
};

export default function ContentImage({ contentImage, className }: ContentImageProp) {
  const image = useMemo(() => {
    const parsedImage = ImageSchema.safeParse(contentImage);
    if (!parsedImage.success || !parsedImage.data) {
      return <Image className={clsx(className, "aspect-[3/2] bg-gray-200")} src={NoImage} alt="No Image" />;
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={className}
        src={parsedImage.data.src}
        alt="見出し画像"
        width={parsedImage.data.width}
        height={parsedImage.data.height}
      />
    );
  }, [contentImage, className]);

  if (!image) {
    return <div className={className} />;
  }
  return image;
}
