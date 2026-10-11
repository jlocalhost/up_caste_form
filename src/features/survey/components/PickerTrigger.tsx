import type { ControlProps } from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import { controlClass } from "@/components/ui/control-class";

/** Field-styled button that opens a picker sheet. */
export default function PickerTrigger({
  control,
  invalid,
  disabled,
  value,
  placeholder,
  onOpen,
}: {
  control: ControlProps;
  invalid?: string;
  disabled?: boolean;
  value?: string;
  placeholder: string;
  onOpen: () => void;
}) {
  return (
    <button
      {...control}
      type="button"
      disabled={disabled}
      onClick={onOpen}
      aria-haspopup="dialog"
      className={`${controlClass(invalid)} flex h-auto min-h-12 items-center justify-between gap-2 text-left disabled:bg-slate-100 disabled:text-slate-400`}
    >
      <span className={value ? "leading-5" : "text-slate-400"}>{value ?? placeholder}</span>
      <Icon name="search" className="size-5 shrink-0 text-slate-400" />
    </button>
  );
}
