type PageProp = {
  params: {
    policyId: string;
  };
};

export default async function Page({ params: { policyId } }: PageProp) {
  return <>{policyId}</>;
}
