import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InputFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  textarea?: boolean;
  rows?: number;
}

export default function InputField({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  textarea = false,
  rows = 4,
}: InputFieldProps) {
  // const Component = textarea ? Textarea : Input;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {textarea ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
        />
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
