import React from "react";

type YearMonthDayProp = {
  yearSelectProps: React.SelectHTMLAttributes<HTMLSelectElement>;
  monthSelectProps: React.SelectHTMLAttributes<HTMLSelectElement>;
  daySelectProps: React.SelectHTMLAttributes<HTMLSelectElement>;
};

const YEAR_START = 1901;
const DEFAULT_YEAR = 2000;

export default function YearMonthDay({ yearSelectProps, monthSelectProps, daySelectProps }: YearMonthDayProp) {
  const current = new Date();

  return (
    <div className="flex gap-2">
      <div>
        <select className="select select-bordered w-24" {...yearSelectProps} defaultValue={DEFAULT_YEAR}>
          {[...Array(current.getFullYear() + 1 - YEAR_START)].map((v, idx) => {
            const year = YEAR_START + idx;
            return <option key={year}>{year}</option>;
          })}
        </select>
        <span className="ms-1">年</span>
      </div>
      <div>
        <select className="select select-bordered w-20" {...monthSelectProps}>
          {[...Array(12)].map((v, idx) => {
            const month = idx + 1;
            return <option key={month}>{month}</option>;
          })}
        </select>
        <span className="ms-1">月</span>
      </div>
      <div>
        <select className="select select-bordered w-20" {...daySelectProps}>
          {[...Array(31)].map((v, idx) => {
            const date = idx + 1;
            return <option key={date}>{date}</option>;
          })}
        </select>
        <span className="ms-1">日</span>
      </div>
    </div>
  );
}
