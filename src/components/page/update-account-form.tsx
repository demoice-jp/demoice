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
import XIcon from "@/components/widget/x-icon";
import { deleteAccount, updateAccount, updateProfile } from "@/lib/action/account-action";

import "cropperjs/dist/cropper.css";

dayjs.extend(utc);
dayjs.extend(timezone);

type UpdateAccountFormProp = {
  user: User;
};

const SMALL_DUMMY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export default function UpdateAccountForm({ user }: UpdateAccountFormProp) {
  const [tab, setTab] = useState<"profile" | "account">("profile");

  return (
    <div className="card w-full">
      <div className="pb-7 p-4 sm:p-7">
        <h3>アカウント更新</h3>
      </div>
      <div role="tablist" className="tabs tabs-bordered">
        <a
          role="tab"
          className={clsx("tab", tab === "profile" && "tab-active")}
          onClick={() => {
            setTab("profile");
          }}
        >
          プロフィール
        </a>
        <a
          role="tab"
          className={clsx("tab", tab === "account" && "tab-active")}
          onClick={() => {
            setTab("account");
          }}
        >
          アカウント
        </a>
      </div>

      <div className="p-4 sm:p-7">
        <div className={clsx(tab !== "profile" && "hidden")}>
          <ProfileEdit user={user} />
        </div>
        <div className={clsx(tab !== "account" && "hidden")}>
          <AccountEdit user={user} />
          <DeleteAccount user={user} />
        </div>
      </div>
    </div>
  );
}

function ProfileEdit({ user }: { user: User }) {
  const [updateState, updateDispatch] = useFormState(updateProfile, {});
  const { refresh } = useRouter();

  useEffect(() => {
    if (updateState.success) {
      refresh();
    }
  }, [updateState, refresh]);

  return (
    <form action={updateDispatch}>
      <span>プロフィールは他のユーザーに公開されます。</span>
      <input type="hidden" name="id" value={user.id} />
      <div className="grid pt-4 sm:grid-cols-12 gap-2 sm:gap-6">
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
          <label htmlFor="user-introduction" className="label mt-1.5">
            <span className="label-text">自己紹介</span>
          </label>
        </div>
        <div className="sm:col-span-9">
          <Introduction defaultValue={user.introduction || ""} />
          <FormError id="user-introduction-error" messages={updateState.errors?.introduction} />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="x-user-name" className="label mt-1.5">
            <span className="label-text">
              <XIcon className="h-[1rem] inline fill-black dark:fill-gray-400" /> ユーザー名
            </span>
          </label>
        </div>
        <div className="sm:col-span-9">
          <input
            id="x-user-name"
            aria-describedby="x-user-name-error"
            type="text"
            name="xUserName"
            className="single-line-input w-full"
            minLength={1}
            maxLength={15}
            placeholder="Xのユーザー名を@なしで入力"
            defaultValue={user.xUserName || ""}
          />
          <FormError id="x-user-name-error" messages={updateState.errors?.xUserName} />
        </div>
        <div className="sm:col-span-3">
          <label htmlFor="web-site" className="label mt-1.5">
            <span className="label-text">ウェブサイト</span>
          </label>
        </div>
        <div className="sm:col-span-9">
          <input
            id="web-site"
            aria-describedby="web-site-error"
            type="url"
            name="webSite"
            maxLength={512}
            className="single-line-input w-full"
            placeholder="https://example.com"
            defaultValue={user.webSite || ""}
          />
          <FormError id="web-site-error" messages={updateState.errors?.webSite} />
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
          <p className="mt-2 text-sm">プロフィールを更新しました。</p>
        </div>
      )}
    </form>
  );
}

function Introduction({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const onChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const element = e.target;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight + 3}px`;
  }, []);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight + 3}px`;
    }
  }, []);

  return (
    <div>
      <textarea
        id="user-introduction"
        aria-describedby="user-introduction-error"
        ref={textAreaRef}
        name="introduction"
        value={value}
        className="textarea textarea-bordered min-h-[2.5rem] w-full resize-none leading-snug"
        maxLength={150}
        placeholder="150字以内で自己紹介を入力"
        onChange={onChange}
      />
      <div className="light-text flex w-full justify-end">{value.length} / 150文字</div>
    </div>
  );
}

function AccountEdit({ user }: { user: User }) {
  const [updateState, updateDispatch] = useFormState(updateAccount, {});
  const { refresh } = useRouter();

  useEffect(() => {
    if (updateState.success) {
      refresh();
    }
  }, [updateState, refresh]);

  return (
    <form action={updateDispatch}>
      <span>これらの情報は非公開情報ですが、統計に利用されます。</span>
      <input type="hidden" name="id" value={user.id} />
      <div className="pt-4 grid sm:grid-cols-12 gap-2 sm:gap-6">
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
          <p className="mt-2 text-sm">アカウント情報を更新しました。</p>
        </div>
      )}
    </form>
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
