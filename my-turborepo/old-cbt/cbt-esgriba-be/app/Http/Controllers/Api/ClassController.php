<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ClassController extends Controller
{
    public function index()
    {
        $classes = Classes::with('major')
            ->withCount('users')
            ->orderBy('class_name')
            ->get();

        return response()->json([
            'data' => $classes
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'major_id' => 'required|exists:majors,id',
            'class_name' => 'required|string|max:100',
            'homeroom_teacher' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $class = Classes::create($request->all());
        $class->load('major');

        return response()->json([
            'message' => 'Kelas berhasil ditambahkan',
            'data' => $class
        ], 201);
    }

    public function show($id)
    {
        $class = Classes::with(['major', 'users'])
            ->findOrFail($id);

        return response()->json([
            'data' => $class
        ]);
    }

    public function update(Request $request, $id)
    {
        $class = Classes::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'major_id' => 'required|exists:majors,id',
            'class_name' => 'required|string|max:100',
            'homeroom_teacher' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $class->update($request->all());
        $class->load('major');

        return response()->json([
            'message' => 'Kelas berhasil diupdate',
            'data' => $class
        ]);
    }

    public function destroy($id)
    {
        $class = Classes::findOrFail($id);
        $class->delete();

        return response()->json([
            'message' => 'Kelas berhasil dihapus'
        ]);
    }
}
