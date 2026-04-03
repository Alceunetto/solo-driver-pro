import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HOURS = Array.from({ length: 15 }, (_, i) => (i + 6).toString().padStart(2, "0")); // 06-20
const MINUTES = ["00", "15", "30", "45"];

interface TimePickerProps {
  value: string; // "HH:MM"
  onChange: (time: string) => void;
  label?: string;
}

export function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [h, m] = (value || "08:00").split(":");
  const hour = HOURS.includes(h) ? h : "08";
  const minute = MINUTES.includes(m) ? m : "00";

  const set = (newH: string, newM: string) => onChange(`${newH}:${newM}`);

  return (
    <div className="space-y-1.5">
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <div className="flex gap-2">
        <Select value={hour} onValueChange={(v) => set(v, minute)}>
          <SelectTrigger className="flex-1 h-12 text-base">
            <SelectValue placeholder="Hora" />
          </SelectTrigger>
          <SelectContent>
            {HOURS.map((hr) => (
              <SelectItem key={hr} value={hr} className="text-base py-2.5">
                {hr}h
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={minute} onValueChange={(v) => set(hour, v)}>
          <SelectTrigger className="w-24 h-12 text-base">
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent>
            {MINUTES.map((mn) => (
              <SelectItem key={mn} value={mn} className="text-base py-2.5">
                {mn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
