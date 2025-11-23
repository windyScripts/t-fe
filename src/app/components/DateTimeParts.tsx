'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";

const hours = Array.from({ length: 24 }, (_, idx) => String(idx).padStart(2, "0"));
const defaultMinutes = ["00", "15", "30", "45"];

type DateTimeRowProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  minuteOptions?: string[];
};

export function DateTimeRow({ label, value, onChange, min, minuteOptions = defaultMinutes }: DateTimeRowProps) {
  const [localDate, setLocalDate] = useState(value ? value.slice(0, 10) : "");
  const [localTime, setLocalTime] = useState(value ? value.slice(11, 16) : "");

  useEffect(() => {
    setLocalDate(value ? value.slice(0, 10) : "");
    setLocalTime(value ? value.slice(11, 16) : "");
  }, [value]);

  const emitIfComplete = (nextDate: string, nextTime: string) => {
    if (nextDate && nextTime) {
      const iso = `${nextDate}T${nextTime}:00`;
      onChange(iso);
    } else {
      onChange("");
    }
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="text-sm flex flex-col gap-1">
        <span className="text-[--muted]">{`${label} date`}</span>
        <input
          className="glass px-3 py-2 focus-ring"
          type="date"
          value={localDate}
          min={min}
          onChange={(e) => {
            setLocalDate(e.target.value);
            emitIfComplete(e.target.value, localTime);
          }}
        />
      </label>
      <TimeSelect
        label={`${label} time`}
        value={localTime}
        minutes={minuteOptions}
        onChange={(v) => {
          setLocalTime(v);
          emitIfComplete(localDate, v);
        }}
      />
    </div>
  );
}

type TimeSelectProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  minutes?: string[];
};

export function TimeSelect({ label, value, onChange, minutes = defaultMinutes }: TimeSelectProps) {
  const hourPart = value ? value.slice(0, 2) : "";
  const minutePart = value ? value.slice(3, 5) : "";

  const handleHour = (h: string) => {
    const next = `${h}:${minutePart || "00"}`;
    onChange(next);
  };
  const handleMinute = (m: string) => {
    const next = `${hourPart || "00"}:${m}`;
    onChange(next);
  };

  return (
    <div className="grid gap-2">
      <span className="text-sm text-[--muted]">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        <select
          className="glass px-3 py-2 focus-ring"
          value={hourPart}
          onChange={(e) => handleHour(e.target.value)}
        >
          <option value="">HH</option>
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <select
          className="glass px-3 py-2 focus-ring"
          value={minutePart}
          onChange={(e) => handleMinute(e.target.value)}
        >
          <option value="">MM</option>
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
