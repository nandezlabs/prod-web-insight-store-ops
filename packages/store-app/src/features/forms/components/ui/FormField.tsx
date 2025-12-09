import type { FormField as FormFieldType } from "../../types";
import {
  CheckboxField,
  TextField,
  NumberField,
  TimeField,
  PhotoField,
  SignatureField,
} from "../fields";

interface FormFieldProps {
  field: FormFieldType;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  onPhotoUpload?: (file: File) => Promise<string>;
}

export function FormField({
  field,
  value,
  onChange,
  error,
  disabled = false,
  onPhotoUpload,
}: FormFieldProps) {
  const commonProps = {
    id: field.id,
    label: field.label,
    error,
    disabled,
  };

  switch (field.type) {
    case "checkbox":
      return (
        <CheckboxField
          {...commonProps}
          value={value ?? false}
          onChange={onChange}
        />
      );

    case "text":
      return (
        <TextField
          {...commonProps}
          value={value ?? ""}
          onChange={onChange}
          placeholder={field.placeholder}
          maxLength={field.validation?.maxLength}
          multiline={field.multiline}
        />
      );

    case "number":
      return (
        <NumberField
          {...commonProps}
          value={value ?? null}
          onChange={onChange}
          min={field.validation?.min}
          max={field.validation?.max}
          placeholder={field.placeholder}
        />
      );

    case "time":
      return (
        <TimeField {...commonProps} value={value ?? ""} onChange={onChange} />
      );

    case "photo":
      if (!onPhotoUpload) {
        console.error("PhotoField requires onPhotoUpload prop");
        return null;
      }
      return (
        <PhotoField
          {...commonProps}
          value={value ?? []}
          onChange={onChange}
          maxPhotos={field.maxPhotos ?? 5}
          onUpload={onPhotoUpload}
        />
      );

    case "signature":
      return (
        <SignatureField
          {...commonProps}
          value={value ?? ""}
          onChange={onChange}
        />
      );

    default:
      console.warn(`Unknown field type: ${(field as any).type}`);
      return null;
  }
}
