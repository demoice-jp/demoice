"use client";

import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Content } from "@prisma/client";
import clsx from "clsx";
import Cropper from "cropperjs";
import Link from "next/link";
import { useFormState } from "react-dom";
import z from "zod";
import FormError from "@/components/widget/form-error";
import SubmitButton from "@/components/widget/submit-button";
import { fillPolicyDraftImage } from "@/lib/action/policy-draft-action";
import "cropperjs/dist/cropper.css";

const ImageSchema = z
  .object({
    src: z.string(),
    width: z.number(),
    height: z.number(),
  })
  .nullable();

type ImageSchema = z.infer<typeof ImageSchema>;

type CreatePolicyImageProp = {
  draft: Content;
};

const SMALL_DUMMY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export default function CreatePolicyImage({ draft }: CreatePolicyImageProp) {
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const [readError, setReadError] = useState("");
  const cropperRef = useRef<Cropper>();
  const [savedImage, setSavedImage] = useState<ImageSchema>(null);
  const [formState, dispatch] = useFormState(fillPolicyDraftImage, {});

  useEffect(() => {
    if (draft.image) {
      const parsedImage = ImageSchema.safeParse(draft.image);
      if (parsedImage.success) {
        setSavedImage(parsedImage.data);
      }
    }
  }, [draft]);

  const onSetImage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setReadError("");
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        setReadError("画像ファイルを読み込めませんでした");
        return;
      }
      setRawImageUrl(dataUrl);
    };

    reader.readAsDataURL(files[0]);
  }, []);

  useEffect(() => {
    if (document) {
      const cropper = cropperRef.current;
      if (cropper) {
        cropper.destroy();
      }
      cropperRef.current = new Cropper(document.getElementById("image-editor") as HTMLImageElement, {
        viewMode: 0,
        aspectRatio: 3 / 2,
        movable: false,
        zoomable: false,
        toggleDragModeOnDblclick: false,
        minCropBoxWidth: 240,
        autoCropArea: 1,
      });
    }
  }, [rawImageUrl]);

  return (
    <>
      <div className="flex flex-col w-screen px-6 md:w-[36rem]">
        <form
          className="flex flex-col gap-1.5"
          action={async () => {
            let image = null;
            let size = null;
            if (cropperRef.current && rawImageUrl) {
              const canvas = cropperRef.current!.getCroppedCanvas({
                maxWidth: 1080,
              });
              image = canvas.toDataURL("image/jpeg", canvas.width > 900 ? 0.8 : canvas.width > 600 ? 0.9 : 1);
              size = {
                width: canvas.width,
                height: canvas.height,
              };
            }

            dispatch({
              id: draft.id,
              image,
              size,
            });
          }}
        >
          <p className="text-xl">見出しとなる画像を添付してください。</p>
          <p>画像は省略可能ですが、注目を集めるために添付をおすすめします。</p>
          <div className="flex justify-between">
            <Link href={`/policy/create/${draft.id}/content`} className="btn">
              戻る
            </Link>
            <SubmitButton type="submit" className="btn btn-primary">
              次へ
            </SubmitButton>
          </div>
          <div className="flex justify-end">
            <FormError messages={formState.message} />
          </div>
        </form>
        <div className="mt-4">
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            accept="image/png,image/jpeg"
            onChange={onSetImage}
          />
          <FormError messages={readError} />
        </div>
      </div>
      <div className={clsx("px-6 my-4", !rawImageUrl && "hidden")}>
        <div className="max-w-[800px] min-w-[240px] min-h-[160px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img id="image-editor" src={rawImageUrl || SMALL_DUMMY_IMAGE} alt="見出し画像編集" />
        </div>
      </div>
      {!rawImageUrl && savedImage && (
        <div className="px-6 my-4 flex w-screen md:w-[36rem] justify-center">
          <div className="w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-full"
              src={savedImage.src}
              width={savedImage.width}
              height={savedImage.height}
              alt="保存済み見出し画像"
            />
          </div>
        </div>
      )}
    </>
  );
}
