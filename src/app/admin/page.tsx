'use client'

import { useMemo, useState } from "react";
import {
  adminBookingsByEmail,
  adminCreateShow,
  adminCreateUser,
  adminUpdateUser,
  AdminCreateShowPayload,
  AdminShowTicketInput,
  BookingRecord,
} from "../lib/api";
import { useBooking } from "../providers/booking-context";

type PanelState = {
  error: string | null;
  message: string | null;
  loading: boolean;
};

const defaultPanel: PanelState = { error: null, message: null, loading: false };

export default function AdminPage() {
  const { auth } = useBooking();
  const isAdmin = auth.role === "admin" || auth.role === "owner";

  if (!isAdmin) {
    return (
      <div className="glass p-6">
        <p className="text-sm text-red-700">Admin access required.</p>
        <p className="text-sm text-[--muted]">
          Login with an admin or owner account to manage users, shows, and bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2 items-start">
      <UserManagement />
      <ShowCreator />
      <BookingLookup />
    </div>
  );
}

function UserManagement() {
  const { auth } = useBooking();
  const [createForm, setCreateForm] = useState({ email: "", password: "", role: "regular_user" });
  const [updateForm, setUpdateForm] = useState({ email: "", role: "regular_user", isEnabled: true });
  const [panel, setPanel] = useState(defaultPanel);
  const [mode, setMode] = useState<"create" | "update">("create");

  const submitCreate = async () => {
    setPanel(defaultPanel);
    if (!createForm.email.includes("@") || createForm.password.length < 5) {
      setPanel({ ...defaultPanel, error: "Valid email and password (>=5 chars) required." });
      return;
    }
    try {
      setPanel({ ...defaultPanel, loading: true });
      await adminCreateUser(auth.token as string, createForm);
      setPanel({ ...defaultPanel, message: "User created." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create user.";
      setPanel({ ...defaultPanel, error: message });
    }
  };

  const submitUpdate = async () => {
    setPanel(defaultPanel);
    if (!updateForm.email.includes("@")) {
      setPanel({ ...defaultPanel, error: "Valid email required." });
      return;
    }
    try {
      setPanel({ ...defaultPanel, loading: true });
      await adminUpdateUser(auth.token as string, updateForm);
      setPanel({ ...defaultPanel, message: "User updated." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update user.";
      setPanel({ ...defaultPanel, error: message });
    }
  };

  return (
    <div className="glass p-6 space-y-4">
      <Header title="User management" badge="Admin API" />
      <div className="flex items-center gap-2">
        <button
          className={`pill px-3 py-2 text-sm font-semibold ${
            mode === "create" ? "bg-[--accent] text-white" : "bg-[--accent-soft] text-[--accent-strong]"
          }`}
          onClick={() => {
            setMode("create");
            setPanel(defaultPanel);
          }}
        >
          Create
        </button>
        <button
          className={`pill px-3 py-2 text-sm font-semibold ${
            mode === "update" ? "bg-[--accent] text-white" : "bg-[--accent-soft] text-[--accent-strong]"
          }`}
          onClick={() => {
            setMode("update");
            setPanel(defaultPanel);
          }}
        >
          Update
        </button>
      </div>
      {mode === "create" ? (
        <div className="grid gap-3">
          <p className="text-sm font-semibold">Create user</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              label="Email"
              value={createForm.email}
              onChange={(v) => setCreateForm((f) => ({ ...f, email: v }))}
            />
            <Input
              label="Password"
              type="password"
              value={createForm.password}
              onChange={(v) => setCreateForm((f) => ({ ...f, password: v }))}
            />
          </div>
          <Select
            label="Role"
            value={createForm.role}
            onChange={(v) => setCreateForm((f) => ({ ...f, role: v }))}
            options={[
              { label: "User", value: "regular_user" },
              { label: "Admin", value: "admin" },
              { label: "Owner", value: "owner" },
            ]}
          />
          <button className="btn text-sm font-semibold w-fit" onClick={submitCreate}>
            Create user
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          <p className="text-sm font-semibold">Update user role/state</p>
          <Input
            label="Email"
            value={updateForm.email}
            onChange={(v) => setUpdateForm((f) => ({ ...f, email: v }))}
          />
          <Select
            label="Role"
            value={updateForm.role}
            onChange={(v) => setUpdateForm((f) => ({ ...f, role: v }))}
            options={[
              { label: "User", value: "regular_user" },
              { label: "Admin", value: "admin" },
              { label: "Owner", value: "owner" },
            ]}
          />
          <Select
            label="Enabled"
            value={updateForm.isEnabled ? "true" : "false"}
            onChange={(v) => setUpdateForm((f) => ({ ...f, isEnabled: v === "true" }))}
            options={[
              { label: "Enabled", value: "true" },
              { label: "Disabled", value: "false" },
            ]}
          />
          <button className="btn text-sm font-semibold w-fit" onClick={submitUpdate}>
            Update user
          </button>
        </div>
      )}
      <PanelStatus panel={panel} />
    </div>
  );
}

function ShowCreator() {
  const { auth } = useBooking();
  const [form, setForm] = useState<AdminCreateShowPayload>({
    name: "",
    startTime: "",
    endTime: "",
    tickets: [
      { ticketId: 1, remainingTickets: 20 },
      { ticketId: 2, remainingTickets: 10 },
    ],
  });
  const [panel, setPanel] = useState(defaultPanel);

  const updateTicket = (index: number, key: keyof AdminShowTicketInput, value: number) => {
    setForm((prev) => {
      const nextTickets = [...(prev.tickets ?? [])];
      nextTickets[index] = { ...nextTickets[index], [key]: value };
      return { ...prev, tickets: nextTickets };
    });
  };

  const submit = async () => {
    setPanel(defaultPanel);
    if (!form.name.trim() || !form.startTime || !form.endTime) {
      setPanel({ ...defaultPanel, error: "Name, start time, and end time are required." });
      return;
    }
    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    if (start >= end) {
      setPanel({ ...defaultPanel, error: "Start must be before end." });
      return;
    }
    try {
      setPanel({ ...defaultPanel, loading: true });
      await adminCreateShow(auth.token as string, form);
      setPanel({ ...defaultPanel, message: "Show created." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create show.";
      setPanel({ ...defaultPanel, error: message });
    }
  };

  return (
    <div className="glass p-6 space-y-4">
      <Header title="Create show" badge="Admin API" />
      <Input label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
      <DateTimeRow
        key={`start-${form.startTime || "blank"}`}
        label="Start"
        value={form.startTime}
        onChange={(v) => setForm((f) => ({ ...f, startTime: v }))}
        min={new Date().toISOString().slice(0, 10)}
      />
      <DateTimeRow
        key={`end-${form.endTime || "blank"}`}
        label="End"
        value={form.endTime}
        onChange={(v) => setForm((f) => ({ ...f, endTime: v }))}
        min={form.startTime ? form.startTime.slice(0, 10) : undefined}
      />
      <div className="space-y-2">
        <p className="text-sm font-semibold">Tickets (use ticket IDs: 1 regular, 2 priority by default)</p>
        {(form.tickets ?? []).map((ticket, idx) => (
          <div key={idx} className="grid gap-2 sm:grid-cols-2">
            <Input
              label="Ticket ID"
              type="number"
              value={String(ticket.ticketId)}
              onChange={(v) => updateTicket(idx, "ticketId", Number(v))}
            />
            <Input
              label="Total Tickets"
              type="number"
              value={String(ticket.remainingTickets)}
              onChange={(v) => updateTicket(idx, "remainingTickets", Number(v))}
            />
          </div>
        ))}
      </div>
      <button className="btn text-sm font-semibold w-fit" onClick={submit}>
        Create show
      </button>
      <PanelStatus panel={panel} />
    </div>
  );
}

function BookingLookup() {
  const { auth } = useBooking();
  const [email, setEmail] = useState("");
  const [panel, setPanel] = useState(defaultPanel);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  const lookup = async () => {
    setPanel(defaultPanel);
    if (!email.includes("@")) {
      setPanel({ ...defaultPanel, error: "Enter a valid email." });
      return;
    }
    try {
      setPanel({ ...defaultPanel, loading: true });
      const res = await adminBookingsByEmail(auth.token as string, email);
      setBookings(res.bookings);
      setPanel({ ...defaultPanel, message: `${res.bookings.length} bookings fetched.` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch bookings.";
      setPanel({ ...defaultPanel, error: message });
    }
  };

  const rows = useMemo(
    () =>
      bookings.map((b) => ({
        id: b.id,
        status: b.status ?? "pending",
        qty: b.quantity,
        showTicketId: b.showTicketId,
        created: b.createdAt ? new Date(b.createdAt).toLocaleString() : "—",
      })),
    [bookings]
  );

  return (
    <div className="glass p-6 space-y-4 xl:col-span-2">
      <Header title="Booking lookup" badge="Admin API" />
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input label="User email" value={email} onChange={setEmail} />
        <button className="btn text-sm font-semibold h-fit" onClick={lookup}>
          Fetch
        </button>
      </div>
      <PanelStatus panel={panel} />
      <div className="grid-auto">
        {rows.map((row) => (
          <div key={row.id} className="border border-[--stroke] rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Booking #{row.id}</p>
              <span className="tag text-xs capitalize">{row.status}</span>
            </div>
            <p className="text-sm text-[--muted]">Qty {row.qty} • ShowTicket {row.showTicketId}</p>
            <p className="text-xs text-[--muted]">{row.created}</p>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="p-4 text-sm text-[--muted] border border-[--stroke] rounded-xl">
            No records yet.
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ title, badge }: { title: string; badge: string }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">{title}</h1>
      <span className="pill px-3 py-1 text-xs text-[--muted]">{badge}</span>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm flex flex-col gap-1">
      <span className="text-[--muted]">{label}</span>
      <input
        className="glass px-3 py-2 focus-ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="text-sm flex flex-col gap-1">
      <span className="text-[--muted]">{label}</span>
      <select
        className="glass px-3 py-2 focus-ring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function DateTimeRow({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) {
  const datePart = value ? value.slice(0, 10) : "";
  const timePart = value ? value.slice(11, 16) : "";
  const [localDate, setLocalDate] = useState(datePart);
  const [localTime, setLocalTime] = useState(timePart);

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
      <Input
        label={`${label} date`}
        type="date"
        value={localDate}
        onChange={(v) => {
          setLocalDate(v);
          emitIfComplete(v, localTime);
        }}
        min={min}
      />
      <TimeSelect
        label={`${label} time`}
        value={localTime}
        onChange={(v) => {
          setLocalTime(v);
          emitIfComplete(localDate, v);
        }}
      />
    </div>
  );
}

function TimeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const minutes = ["00", "15", "30", "45"];
  const hours = Array.from({ length: 24 }, (_, idx) => String(idx).padStart(2, "0"));
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

function PanelStatus({ panel }: { panel: PanelState }) {
  if (panel.loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[--muted]">
        <div className="h-4 w-4 rounded-full border-2 border-[--accent] border-t-transparent animate-spin" />
        Working…
      </div>
    );
  }
  if (panel.error) return <p className="text-sm text-red-600">{panel.error}</p>;
  if (panel.message) return <p className="text-sm text-[--accent]">{panel.message}</p>;
  return null;
}
