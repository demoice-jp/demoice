import clsx from "clsx";

type PolicyCreateStepsProp = {
  currentStep: 1 | 2 | 3;
};

const STEPS = [
  {
    name: "概要",
  },
  {
    name: "本文記載",
  },
  {
    name: "画像添付",
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
