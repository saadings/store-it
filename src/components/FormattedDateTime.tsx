import { cn, formatDateTime } from "@/lib/utils";
import type { ClassValue } from "clsx";

interface FormattedDateTimeProps {
  date: string;
  className?: ClassValue;
}

const FormattedDateTime = ({ date, className }: FormattedDateTimeProps) => {
  return (
    <p className={cn("body-1 text-light-200", className)}>
      {formatDateTime(date)}
    </p>
  );
};

export default FormattedDateTime;
