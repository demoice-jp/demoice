import PolicyCreateSteps from "@/components/component/policy-create-steps";
import CreatePolicyStep1Form from "@/components/page/create-policy-step1-form";

type PageProp = {
  params: {
    draftId: string;
  };
};

export default async function Page({ params: { draftId } }: PageProp) {
  console.log(draftId);
  return (
    <>
      <PolicyCreateSteps currentStep={1} />
      <CreatePolicyStep1Form />
    </>
  );
}
