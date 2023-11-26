"use server";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import IdProvider from "@/lib/data/id-provider";
import prefecture from "@/lib/data/prefecture";
import prisma from "@/lib/orm/client";

dayjs.extend(customParseFormat);

const AccountSchema = z.object({
  id: z.string(),
  createdDate: z.string(),
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

const CreateAccountSchema = AccountSchema.omit({ id: true, createdDate: true });

export type CreateAccountState = {
  errors?: {
    userName?: string[];
    gender?: string[];
    birthDate?: string[];
    prefecture?: string[];
  };
  message?: string | null;
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
        userName: parsedInput.data.userName,
        gender: parsedInput.data.gender,
        birthDate: parsedInput.data.birthDate,
        prefecture: parsedInput.data.prefecture,
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

  redirect("/");
}
