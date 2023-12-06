"use client";

import React, { useRef } from "react";
import { $generateHtmlFromNodes } from "@lexical/html";
import { PolicyDraft } from "@prisma/client";
import { $getRoot, EditorState, LexicalEditor } from "lexical";
import Link from "next/link";
import { useFormState } from "react-dom";
import RichTextEditor from "@/components/widget/editor/rich-text-editor";
import FormError from "@/components/widget/form-error";
import SubmitButton from "@/components/widget/submit-button";
import { fillPolicyDraftContent } from "@/lib/action/policy-draft-action";

type CreatePolicyStep2Prop = {
  draft: PolicyDraft;
};

export default function CreatePolicyStep2({ draft }: CreatePolicyStep2Prop) {
  const editorRef = useRef<LexicalEditor>();
  const editorStateRef = useRef<EditorState>();

  const [formState, dispatch] = useFormState(fillPolicyDraftContent, {});

  return (
    <>
      <form
        className="flex flex-col gap-1.5 w-screen px-6 md:w-[36rem]"
        action={async () => {
          if (editorStateRef.current && editorRef.current) {
            const editor = editorRef.current;
            const editorState = editorStateRef.current;
            editorState.read(() => {
              dispatch({
                id: draft.id,
                content: JSON.stringify(editorState),
                contentHtml: $generateHtmlFromNodes(editor),
                contentString: $getRoot().getTextContent(),
              });
            });
          } else {
            dispatch({
              id: draft.id,
              content: "",
              contentHtml: "",
              contentString: "",
            });
          }
        }}
      >
        <p className="text-xl">
          <label htmlFor="policy-summary">政策の本文を記載してください。</label>
        </p>
        <div className="flex justify-between">
          <Link href={`/policy/create/${draft.id}/step1`} className="btn">
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
      <div className="w-full px-4 my-4 md:max-w-[60rem]">
        <RichTextEditor
          className="min-h-[24rem]"
          initialState={draft.content || undefined}
          editorStateRef={editorStateRef}
          editorRef={editorRef}
        />
      </div>
    </>
  );
}
