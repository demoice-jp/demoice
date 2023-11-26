"use server";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { z } from "zod";
import prefecture from "@/lib/data/prefecture";

dayjs.extend(customParseFormat);

const AccountSchema = z.object({
  id: z.string(),
  createdDate: z.string(),
  userName: z.string().min(3).max(15),
  gender: z.enum(["male", "female"], {
    required_error: "性別を選択してください。",
  }),
  birthDate: z.string().refine((date) => dayjs(date, "YYYY-MM-DD", true).isValid(), {
    message: "有効な日付を入力してください。",
  }),
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

export async function createAccount(prevState: CreateAccountState, formData: FormData) {
  const inputs = arrangeBirthDate(Object.fromEntries(formData));

  const parsedInput = CreateAccountSchema.safeParse(inputs);

  if (!parsedInput.success) {
    return {
      errors: parsedInput.error.flatten().fieldErrors,
    };
  }
  return {};
}
