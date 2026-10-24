export type ControllerType = 'plain' | 'resource' | 'api' | 'invokable';

export interface ControllerOptions {
  className: string;
  namespace: string;
  type: ControllerType;
}

/**
 * Generates the PHP code for a Laravel Controller.
 * Follows PSR-12 and standard Laravel conventions.
 */
export function renderControllerTemplate(options: ControllerOptions): string {
  const { className, namespace, type } = options;

  let body = '';

  switch (type) {
    case 'invokable':
      body = `    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        //
    }`;
      break;

    case 'api':
      body = `    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }`;
      break;

    case 'resource':
      body = `    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }`;
      break;

    case 'plain':
    default:
      body = `    //`;
      break;
  }

  return `<?php

namespace ${namespace};

use Illuminate\\Http\\Request;

class ${className} extends Controller
{
${body}
}
`;
}
