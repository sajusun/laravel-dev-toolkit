export interface FormRequestOptions {
  className: string;
  namespace: string;
}

/**
 * Generates the PHP code for a Laravel Form Request.
 * Follows PSR-12 and modern Laravel conventions.
 */
export function renderFormRequestTemplate(options: FormRequestOptions): string {
  const { className, namespace } = options;

  return `<?php

namespace ${namespace};

use Illuminate\\Foundation\\Http\\FormRequest;

class ${className} extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \\Illuminate\\Contracts\\Validation\\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //
        ];
    }
}
`;
}
