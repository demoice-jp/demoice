import clsx from "clsx";

type PolicyCreateStepsProp = {
  currentStep: 1 | 2 | 3 | 4;
};

const STEPS = [
  {
    name: "タイトル",
  },
  {
    name: "本文",
  },
  {
    name: "見出し画像",
  },
  {
    name: "確認",
  },
];

export default function PolicyCreateSteps({ currentStep }: PolicyCreateStepsProp) {
  return (
    <ul className="steps mb-4">
      {STEPS.map((step, idx) => (
        <li key={step.name} className={clsx("step", idx < currentStep && "step-primary")}>
          <span className="w-28">{step.name}</span>
        </li>
      ))}
    </ul>
  );
}
