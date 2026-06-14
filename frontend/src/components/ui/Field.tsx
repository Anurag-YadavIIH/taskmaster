import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

const baseFieldClasses =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500 disabled:bg-gray-50 disabled:text-gray-500";

interface FieldWrapperProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FieldWrapper({ label, htmlFor, error, hint, children, className }: FieldWrapperProps) {
  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className, ...rest }: InputFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error} hint={hint}>
      <input
        id={id}
        className={clsx(baseFieldClasses, error && "border-red-400 focus:outline-red-500", className)}
        {...rest}
      />
    </FieldWrapper>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function TextArea({ label, error, hint, id, className, ...rest }: TextAreaFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error} hint={hint}>
      <textarea
        id={id}
        className={clsx(baseFieldClasses, "resize-none", error && "border-red-400 focus:outline-red-500", className)}
        {...rest}
      />
    </FieldWrapper>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Select({ label, error, hint, id, className, children, ...rest }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error} hint={hint}>
      <select
        id={id}
        className={clsx(baseFieldClasses, "cursor-pointer", error && "border-red-400 focus:outline-red-500", className)}
        {...rest}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
