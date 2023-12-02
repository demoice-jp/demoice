import clsx from "clsx";

type PolicyCreateStepsProp = {
  currentStep: 1 | 2 | 3;
};

const STEPS = [
  {
    name: "概要",
  },
  {
    name: "詳細内容",
  },
  {
    name: "メイン画像",
  },
];

export default function PolicyCreateSteps({ currentStep }: PolicyCreateStepsProp) {
  return (
    <ul className="steps mb-4">
      {STEPS.map((step, idx) => (
        <li key={step.name} className={clsx("step", idx < currentStep && "step-primary")}>
          {step.name}
        </li>
      ))}
    </ul>
  );
}
