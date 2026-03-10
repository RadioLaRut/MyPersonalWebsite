import React, { useState, useRef, useCallback, useEffect, type ComponentType, type ReactNode } from "react";
import { FieldLabel, type CustomFieldRender } from "@measured/puck";

interface ChineseTextInputProps {
  value?: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  name?: string;
  id?: string;
  label?: string;
  labelIcon?: ReactNode;
  Label?: ComponentType<{
    children?: ReactNode;
    icon?: ReactNode;
    label: string;
    el?: "label" | "div";
    readOnly?: boolean;
    className?: string;
  }>;
  readOnly?: boolean;
  placeholder?: string;
}

function ChineseTextInput({
  value,
  onChange,
  multiline,
  name,
  id,
  label,
  labelIcon,
  Label,
  readOnly,
  placeholder,
}: ChineseTextInputProps) {
  const [localValue, setLocalValue] = useState(value || "");
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsComposing(false);
      const newValue = e.currentTarget.value;
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      if (!isComposing) {
        onChange(newValue);
      }
    },
    [isComposing, onChange]
  );

  const handleBlur = useCallback(() => {
    if (!isComposing && localValue !== value) {
      onChange(localValue);
    }
  }, [isComposing, localValue, value, onChange]);

  const baseClassName =
    "w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";
  const resolvedLabel = label || name;
  const FieldWrapper = Label ?? FieldLabel;

  if (multiline) {
    const textarea = (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        id={id}
        name={name}
        value={localValue}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onBlur={handleBlur}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        placeholder={placeholder}
        className={`${baseClassName} resize-none min-h-[80px]`}
        rows={5}
      />
    );

    if (!resolvedLabel) {
      return textarea;
    }

    return (
      <FieldWrapper label={resolvedLabel} icon={labelIcon} readOnly={readOnly}>
        {textarea}
      </FieldWrapper>
    );
  }

  const input = (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      id={id}
      type="text"
      name={name}
      value={localValue}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onBlur={handleBlur}
      readOnly={readOnly}
      tabIndex={readOnly ? -1 : undefined}
      placeholder={placeholder}
      title={resolvedLabel}
      className={baseClassName}
    />
  );

  if (!resolvedLabel) {
    return input;
  }

  return (
    <FieldWrapper label={resolvedLabel} icon={labelIcon} readOnly={readOnly}>
      {input}
    </FieldWrapper>
  );
}

export const ChineseTextInputField: React.FC<ChineseTextInputProps> = (props) => {
  return <ChineseTextInput {...props} />;
};

interface ChineseTextFieldProps {
  multiline?: boolean;
}

export function createChineseTextField(
  props: ChineseTextFieldProps = {}
): {
  type: "custom";
  render: CustomFieldRender<string>;
} {
  const RenderComponent: CustomFieldRender<string> = ({ field, value, onChange, name, id, readOnly }) => {
    return (
      <ChineseTextInput
        value={value || ""}
        onChange={onChange}
        multiline={props.multiline}
        name={name}
        id={id}
        label={field.label}
        readOnly={readOnly}
      />
    );
  };

  return {
    type: "custom",
    render: RenderComponent,
  };
}
