<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CacheResponse
{
    public function handle(Request $request, Closure $next, $ttl = 300): Response
    {
        if ($request->method() !== 'GET') {
            return $next($request);
        }

        $key = $this->getCacheKey($request);

        $cachedResponse = Cache::get($key);

        if ($cachedResponse !== null) {
            return response()->json($cachedResponse);
        }

        $response = $next($request);

        if ($response->isSuccessful() && $response instanceof \Illuminate\Http\JsonResponse) {
            Cache::put($key, $response->getData(true), (int)$ttl);
        }

        return $response;
    }

    protected function getCacheKey(Request $request): string
    {
        $url = $request->url();
        $queryParams = $request->query();
        $user = $request->user();
        
        ksort($queryParams);

        return 'api_cache_' . md5(
            $url . 
            serialize($queryParams) . 
            ($user ? $user->id : 'guest') . 
            ($user ? $user->role : '')
        );
    }

    public static function clearPatternCache(string $pattern): void
    {
        $keys = Cache::get('cache_keys', []);
        foreach ($keys as $key) {
            if (str_contains($key, $pattern)) {
                Cache::forget($key);
            }
        }
    }
}
