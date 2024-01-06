"use client";

import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { User } from "@prisma/client";
import clsx from "clsx";
import Cropper from "cropperjs";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import NoAvatar from "@/asset/no_avatar.svg";
import FormError from "@/components/widget/form-error";
import PrefectureSelect from "@/components/widget/prefecture-select";
import SubmitButton from "@/components/widget/submit-button";
import SubmitCancelButton from "@/components/widget/submit-cancel-button";
import UserAvatar from "@/components/widget/user-avatar";
import { deleteAccount, updateAccount } from "@/lib/action/account-action";

import "cropperjs/dist/cropper.css";

dayjs.extend(utc);
dayjs.extend(timezone);

type UpdateAccountFormProp = {
  user: User;
};

const SMALL_DUMMY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export default function UpdateAccountForm({ user }: UpdateAccountFormProp) {
  const [updateState, updateDispatch] = useFormState(updateAccount, {});
  const { refresh } = useRouter();

  useEffect(() => {
    if (updateState.success) {
      refresh();
    }
  }, [updateState, refresh]);

  return (
    <div className="card w-full p-4 sm:p-7">
      <div className="mb-8">
        <h3>アカウント更新</h3>
        <p className="light-text">以下の項目を入力して下さい。</p>
      </div>
      <form action={updateDispatch}>
        <input type="hidden" name="id" value={user.id} />
        <div className="grid sm:grid-cols-12 gap-2 sm:gap-6">
          <div className="sm:col-span-3">
            <label htmlFor="user-name" className="label mt-1.5">
              <span className="label-text">ユーザー名</span>
            </label>
          </div>
          <div className="sm:col-span-9">
            <input
              id="user-name"
              aria-describedby="user-name-error"
              type="text"
              name="userName"
              className="single-line-input w-full"
              required
              minLength={3}
              maxLength={15}
              defaultValue={user.userName}
            />
            <FormError id="user-name-error" messages={updateState.errors?.userName} />
          </div>

          <div className="sm:col-span-3">
            <label className="label mt-1.5">
              <span className="label-text">アバター</span>
            </label>
          </div>
          <div className="sm:col-span-9 self-center">
            <AvatarEdit user={user} />
          </div>

          <div className="sm:col-span-3">
            <label className="label mt-1.5">
              <span className="label-text">性別</span>
            </label>
          </div>
          <div className="sm:col-span-9 self-center">{user.gender === "male" ? "男性" : "女性"}</div>

          <div className="sm:col-span-3">
            <label htmlFor="birth-year" className="label mt-1.5">
              <span className="label-text">生年月日</span>
            </label>
          </div>
          <div className="sm:col-span-9 self-center">{dayjs(user.birthDate).tz("UTC").format("YYYY年MM月DD日")}</div>

          <div className="sm:col-span-3">
            <label className="label mt-1.5" htmlFor="prefecture">
              <span className="label-text">都道府県(住所)</span>
            </label>
          </div>
          <div className="sm:col-span-9">
            <PrefectureSelect
              id="prefecture-error"
              aria-describedby="prefecture"
              name="prefecture"
              className="select select-bordered w-32"
              required
              defaultValue={user.prefecture}
            />
            <FormError id="prefecture-error" messages={updateState.errors?.prefecture} />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="birth-year" className="label mt-1.5">
              <span className="label-text">登録日</span>
            </label>
          </div>
          <div className="sm:col-span-9 self-center">
            {dayjs(user.createdDate).tz("Asia/Tokyo").format("YYYY年MM月DD日")}
          </div>
        </div>
        {updateState.message && (
          <div className="w-full flex justify-end">
            <FormError messages={[updateState.message]} />
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <SubmitButton>更新</SubmitButton>
        </div>
        {updateState.success && (
          <div className="w-full flex justify-end">
            <p className="mt-2 text-sm">会員情報を更新しました。</p>
          </div>
        )}
      </form>
      <DeleteAccount user={user} />
    </div>
  );
}

function AvatarEdit({ user }: { user: User }) {
  const cropperRef = useRef<Cropper>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawAvatarImage, setRawAvatarImage] = useState<string | null>(null);
  const [readRawImageError, setReadRawImageError] = useState<string>("");
  const [newAvatar, setNewAvatar] = useState<{
    avatar128: string;
    avatar64: string;
    avatar32: string;
  } | null>(null);
  const [deleteAvatar, setDeleteAvatar] = useState(false);

  const onSetRawAvatarImage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    setReadRawImageError("");

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        setReadRawImageError("画像ファイルを読み込めませんでした");
        return;
      }
      setRawAvatarImage(dataUrl);
    };

    reader.readAsDataURL(files[0]);
  }, []);

  const closeModal = useCallback(() => {
    if (document) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      (document.getElementById("avatar-upload-modal") as HTMLFormElement)?.close();
    }
  }, []);

  const onSetAvatarImage = useCallback(() => {
    if (!rawAvatarImage || !cropperRef.current) {
      return;
    }

    setNewAvatar({
      avatar128: cropperRef
        .current!.getCroppedCanvas({
          width: 128,
          height: 128,
        })
        .toDataURL("image/png"),
      avatar64: cropperRef
        .current!.getCroppedCanvas({
          width: 64,
          height: 64,
        })
        .toDataURL("image/png"),
      avatar32: cropperRef
        .current!.getCroppedCanvas({
          width: 32,
          height: 32,
        })
        .toDataURL("image/png"),
    });
    setDeleteAvatar(false);

    closeModal();
  }, [rawAvatarImage, closeModal]);

  const onDeleteAvatarImage = useCallback(() => {
    setDeleteAvatar(true);
    setRawAvatarImage(null);
    setNewAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    closeModal();
  }, [closeModal]);

  useEffect(() => {
    if (document) {
      const cropper = cropperRef.current;
      if (cropper) {
        cropper.destroy();
      }
      cropperRef.current = new Cropper(document.getElementById("avatar-cropper") as HTMLImageElement, {
        viewMode: 1,
        aspectRatio: 1,
        movable: false,
        zoomable: false,
        toggleDragModeOnDblclick: false,
        minCropBoxWidth: 32,
        autoCropArea: 1,
      });
    }
  }, [rawAvatarImage]);

  return (
    <>
      <button
        type="button"
        className="w-20 h-20 rounded-full overflow-hidden"
        onClick={() => {
          if (document) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            (document.getElementById("avatar-upload-modal") as HTMLFormElement)?.showModal();
          }
        }}
      >
        {newAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img width={128} height={128} src={newAvatar.avatar128} alt="アバター" />
        ) : deleteAvatar ? (
          <Image src={NoAvatar} alt="アバター" />
        ) : (
          <UserAvatar user={user} size={128} />
        )}
        {newAvatar && (
          <>
            <input type="hidden" name="avatar128" value={newAvatar.avatar128} />
            <input type="hidden" name="avatar64" value={newAvatar.avatar64} />
            <input type="hidden" name="avatar32" value={newAvatar.avatar32} />
          </>
        )}
        {!newAvatar && user.avatar && deleteAvatar && (
          <>
            <input type="hidden" name="deleteAvatar" value="true" />
          </>
        )}
      </button>
      <dialog id="avatar-upload-modal" className="modal">
        <div className="modal-box">
          <h4>アバター変更</h4>
          <input
            ref={fileInputRef}
            type="file"
            className="file-input file-input-bordered w-full"
            accept="image/png,image/jpeg"
            onChange={onSetRawAvatarImage}
          />
          <FormError messages={readRawImageError} />
          <div className={clsx("mt-4 max-h-[18rem]", !rawAvatarImage && "hidden")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img id="avatar-cropper" src={rawAvatarImage || SMALL_DUMMY_IMAGE} alt="アバター編集" />
          </div>
          <div className="modal-action">
            <button disabled={!rawAvatarImage} type="button" className="btn btn-primary" onClick={onSetAvatarImage}>
              変更
            </button>
            <button
              disabled={!(!deleteAvatar && (newAvatar || user.avatar))}
              type="button"
              className="btn btn-warning"
              onClick={onDeleteAvatarImage}
            >
              削除
            </button>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>
              キャンセル
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

function DeleteAccount({ user }: { user: User }) {
  const [deleteState, deleteDispatch] = useFormState(deleteAccount, {});

  return (
    <>
      <div className="mt-24 flex justify-end">
        <button
          className="btn btn-outline btn-error"
          onClick={() => {
            if (document) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              (document.getElementById("delete-account-modal") as HTMLFormElement)?.showModal();
            }
          }}
        >
          アカウント削除
        </button>
      </div>
      <dialog id="delete-account-modal" className="modal">
        <div className="modal-box">
          <p>この操作は元に戻すことができません。本当にアカウントを削除してもよろしいでしょうか？</p>
          <form action={deleteDispatch} className="modal-footer-buttons">
            <input type="hidden" name="id" value={user.id} />
            <SubmitCancelButton
              onClick={(e) => {
                e.preventDefault();
                if (document) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  (document.getElementById("delete-account-modal") as HTMLFormElement)?.close();
                }
              }}
            >
              キャンセル
            </SubmitCancelButton>
            <SubmitButton className="btn btn-error">アカウント削除</SubmitButton>
          </form>
          {deleteState.message && (
            <div className="flex justify-end">
              <FormError messages={[deleteState.message]} />
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
