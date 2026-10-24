export interface ApiResourceOptions {
  className: string;
  namespace: string;
}

/**
 * Generates the PHP code for a Laravel API Resource.
 * Follows PSR-12 and modern Laravel conventions.
 */
export function renderApiResourceTemplate(options: ApiResourceOptions): string {
  const { className, namespace } = options;

  return `<?php

namespace ${namespace};

use Illuminate\\Http\\Request;
use Illuminate\\Http\\Resources\\Json\\JsonResource;

class ${className} extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
}
`;
}
