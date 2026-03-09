import React, { useState, useRef, useCallback, useEffect } from "react";
import type { CustomFieldRender } from "@measured/puck";

interface ChineseTextInputProps {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  name?: string;
}

function ChineseTextInput({ value, onChange, multiline, name }: ChineseTextInputProps) {
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

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        name={name}
        value={localValue}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onBlur={handleBlur}
        className={`${baseClassName} resize-none min-h-[80px]`}
        rows={4}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      name={name}
      value={localValue}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onBlur={handleBlur}
      className={baseClassName}
    />
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
  const RenderComponent: CustomFieldRender<string> = ({ value, onChange, name }) => {
    return (
      <ChineseTextInput
        value={value || ""}
        onChange={onChange}
        multiline={props.multiline}
        name={name}
      />
    );
  };

  return {
    type: "custom",
    render: RenderComponent,
  };
}
