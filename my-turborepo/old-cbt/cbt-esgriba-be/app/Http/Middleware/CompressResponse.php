<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CompressResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!$response instanceof \Illuminate\Http\JsonResponse) {
            return $response;
        }

        if ($this->shouldCompress($request)) {
            $content = $response->getContent();
            $compressed = gzencode($content, 6);
            
            if ($compressed !== false && strlen($compressed) < strlen($content)) {
                $response->setContent($compressed);
                $response->headers->set('Content-Encoding', 'gzip');
                $response->headers->set('Content-Length', strlen($compressed));
            }
        }

        return $response;
    }

    protected function shouldCompress(Request $request): bool
    {
        $acceptEncoding = $request->header('Accept-Encoding', '');
        return str_contains($acceptEncoding, 'gzip');
    }
}
