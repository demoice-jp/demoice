"use server";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, signOut } from "@/lib/auth/auth";
import IdProvider from "@/lib/data/id-provider";
import prefecture from "@/lib/data/prefecture";
import prisma from "@/lib/orm/client";

dayjs.extend(customParseFormat);

const AccountSchema = z.object({
  userName: z.string().min(3).max(15),
  gender: z.enum(["male", "female"], {
    required_error: "性別を選択してください。",
  }),
  birthDate: z
    .string()
    .refine((date) => dayjs(date, "YYYY-MM-DD", true).isValid(), {
      message: "有効な日付を入力してください。",
    })
    .transform((date) => dayjs(date, "YYYY-MM-DD", true).toDate()),
  prefecture: z
    .string({
      required_error: "都道府県を選択してください。",
    })
    .refine((id) => !!prefecture[id], "都道府県を選択してください。"),
});

const CreateAccountSchema = AccountSchema;
const UpdateAccountSchema = AccountSchema.omit({ gender: true, birthDate: true });

export type CreateAccountState = {
  errors?: {
    userName?: string[];
    gender?: string[];
    birthDate?: string[];
    prefecture?: string[];
  };
  message?: string;
  success?: boolean;
};

export type UpdateAccountState = {
  errors?: {
    userName?: string[];
    prefecture?: string[];
  };
  message?: string;
  success?: boolean;
};

export type DeleteAccountState = {
  message?: string;
};

function arrangeBirthDate(inputs: { [key: string]: FormDataEntryValue }) {
  function padZero(val: FormDataEntryValue) {
    return typeof val === "string" ? val.padStart(2, "0") : "00";
  }

  const { birthYear, birthMonth, birthDate } = inputs;
  const result: { [key: string]: FormDataEntryValue } = {
    ...inputs,
    birthDate: `${birthYear}-${padZero(birthMonth)}-${padZero(birthDate)}`,
  };

  delete result.birthYear;
  delete result.birthMonth;

  return result;
}

export async function createAccount(prevState: CreateAccountState, formData: FormData): Promise<CreateAccountState> {
  const inputs = arrangeBirthDate(Object.fromEntries(formData));

  const parsedInput = CreateAccountSchema.safeParse(inputs);

  if (!parsedInput.success) {
    return {
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const session = await auth();
  if (session?.valid) {
    redirect("/auth/signup?error=DUPLICATED_ACCOUNT");
  }

  try {
    const existingName = await prisma.user.findUnique({
      select: {
        id: true,
      },
      where: {
        userName: parsedInput.data.userName,
      },
    });
    if (existingName) {
      return {
        errors: {
          userName: ["このユーザー名は既に利用されています。ユーザー名を変更してください。"],
        },
      };
    }

    if (!session || !session.provider || !session.provider.provider || !session.provider.providerAccountId) {
      return {
        message: "予期しないエラーが発生しました。",
      };
    }

    await prisma.user.create({
      data: {
        id: nanoid(),
        userName: parsedInput.data.userName,
        gender: parsedInput.data.gender,
        birthDate: parsedInput.data.birthDate,
        prefecture: parsedInput.data.prefecture,
        deleted: false,
        idProvider: {
          create: {
            provider: IdProvider.validateProviderId(session.provider.provider),
            providerId: session.provider.providerAccountId,
          },
        },
      },
    });
  } catch (e) {
    console.error(e);
    return {
      message: "会員情報の登録に失敗しました。もう一度登録してください。",
    };
  }

  return {
    success: true,
  };
}

export async function updateAccount(prevState: UpdateAccountState, formData: FormData): Promise<UpdateAccountState> {
  const session = await auth();
  if (!session?.valid || formData.get("id") !== session?.user?.accountId) {
    redirect("/auth/signin");
  }

  const parsedInput = UpdateAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsedInput.success) {
    return {
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }

  const existingName = await prisma.user.findFirst({
    select: {
      id: true,
    },
    where: {
      AND: {
        id: {
          not: session.user.accountId,
        },
        userName: parsedInput.data.userName,
      },
    },
  });
  if (existingName) {
    return {
      errors: {
        userName: ["このユーザー名は既に利用されています。"],
      },
    };
  }

  try {
    await prisma.user.update({
      data: {
        userName: parsedInput.data.userName,
        prefecture: parsedInput.data.prefecture,
        updatedDate: new Date(),
      },
      where: {
        id: session.user.accountId,
      },
    });
  } catch (e) {
    console.error(e);
    return {
      message: "アカウントの更新に失敗しました。",
    };
  }

  return {
    success: true,
  };
}

export async function deleteAccount(prevState: CreateAccountState, formData: FormData): Promise<DeleteAccountState> {
  const session = await auth();
  if (!session?.valid || formData.get("id") !== session?.user?.accountId) {
    redirect("/auth/signin");
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        data: {
          userName: session.user.accountId, //ユーザー名が再利用できるように
          updatedDate: new Date(),
          deleted: true,
        },
        where: {
          id: session.user.accountId,
        },
      }),
      prisma.providerId.deleteMany({
        where: {
          userId: session.user.accountId,
        },
      }),
    ]);
  } catch (e) {
    console.error(e);
    return {
      message: "アカウントの削除に失敗しました。",
    };
  }
  await signOut({
    redirectTo: "/",
  });
  return {};
}
