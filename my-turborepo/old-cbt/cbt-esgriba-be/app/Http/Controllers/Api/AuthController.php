<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|in:admin,guru,siswa',
            'nim_nip' => 'nullable|string',
            'kelas' => 'nullable|string',
            'jurusan' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'nim_nip' => $request->nim_nip,
            'kelas' => $request->kelas,
            'jurusan' => $request->jurusan,
            'phone' => $request->phone,
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        // Check if email is actually a NISN (only numbers)
        $isNISN = preg_match('/^\d+$/', $credentials['email']);

        if ($isNISN) {
            // Login with NISN and password (for students)
            $validator = Validator::make($credentials, [
                'email' => 'required|string',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Find user by NISN
            $user = User::where('nisn', $credentials['email'])
                ->where('role', 'siswa')
                ->first();

            if (!$user) {
                return response()->json(['message' => 'NISN tidak ditemukan'], 401);
            }

            if (!$user->is_active) {
                return response()->json(['message' => 'Akun tidak aktif'], 403);
            }

            // Verify password
            if (!Hash::check($credentials['password'], $user->password)) {
                return response()->json(['message' => 'NISN atau password salah'], 401);
            }

            // Generate token for the user
            $token = JWTAuth::fromUser($user);

            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
                'token' => $token,
            ]);
        } else {
            // Normal login with email and password (for guru and admin only)
            $validator = Validator::make($credentials, [
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            $user = auth()->user();

            // Block students from logging in with email
            if ($user->role === 'siswa') {
                JWTAuth::invalidate($token);
                return response()->json(['message' => 'Siswa harus login menggunakan NISN, bukan email'], 403);
            }

            if (!$user->is_active) {
                return response()->json(['message' => 'Account is not active'], 403);
            }

            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
                'token' => $token,
            ]);
        }
    }

    /**
     * Get authenticated user
     */
    public function me()
    {
        return response()->json(auth()->user());
    }

    /**
     * Logout user
     */
    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh token
     */
    public function refresh()
    {
        $token = JWTAuth::refresh(JWTAuth::getToken());

        return response()->json(['token' => $token]);
    }
}
