import { FieldValues, FieldPath, UseFormSetError } from "react-hook-form"

/**
 * A helper to parse an ASP.NET validation error response
 * and set errors on a React Hook Form instance.
 */
export function handleFormErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  defaultMessage = "An error occurred."
) {
  const err = error as any
  const errorData = err?.response?.data

  if (errorData?.errors) {
    // Dictionary of field: string[]
    if (!Array.isArray(errorData.errors)) {
      Object.entries(errorData.errors).forEach(([field, messages]) => {
        const msg = (messages as string[]).join(", ")
        // Backend might return "root" for form-level errors:
        if (field === "root") {
          setError("root", { type: "server", message: msg })
        } else {
          // Otherwise assume 'field' is a valid key in T
          setError(field as FieldPath<T>, { type: "server", message: msg })
        }
      })
    } 
    // Array of { code, description } objects
    else {
      const errorMessages = errorData.errors.map((e: any) => e.description)
      setError("root", { message: errorMessages.join("\n") })
    }
  } else {
    setError("root", {
      message: errorData?.message || defaultMessage,
    })
  }
}
