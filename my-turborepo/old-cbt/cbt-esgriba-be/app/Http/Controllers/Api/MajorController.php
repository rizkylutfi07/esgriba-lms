<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Major;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MajorController extends Controller
{
    public function index()
    {
        $majors = Major::withCount(['classes', 'subjects', 'users'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $majors
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:10|unique:majors',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $major = Major::create($request->all());

        return response()->json([
            'message' => 'Jurusan berhasil ditambahkan',
            'data' => $major
        ], 201);
    }

    public function show($id)
    {
        $major = Major::with(['classes', 'subjects'])
            ->withCount(['users'])
            ->findOrFail($id);

        return response()->json([
            'data' => $major
        ]);
    }

    public function update(Request $request, $id)
    {
        $major = Major::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:10|unique:majors,code,' . $id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $major->update($request->all());

        return response()->json([
            'message' => 'Jurusan berhasil diupdate',
            'data' => $major
        ]);
    }

    public function destroy($id)
    {
        $major = Major::findOrFail($id);
        $major->delete();

        return response()->json([
            'message' => 'Jurusan berhasil dihapus'
        ]);
    }
}
