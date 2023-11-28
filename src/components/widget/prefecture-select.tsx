import React from "react";
import Prefecture from "@/lib/data/prefecture";

export default function PrefectureSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select defaultValue="-1" {...props}>
      <option disabled value="-1">
        都道府県
      </option>
      {Object.entries(Prefecture)
        .sort(([id1], [id2]) => (id1 < id2 ? -1 : 1))
        .map((p) => (
          <option key={p[0]} value={p[0]}>
            {p[1]}
          </option>
        ))}
    </select>
  );
}
