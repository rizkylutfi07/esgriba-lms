<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AcademicYearController extends Controller
{
    public function index()
    {
        $academicYears = AcademicYear::withCount('tests')
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json([
            'data' => $academicYears
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:academic_years',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // If setting as active, deactivate all others
            if ($request->is_active) {
                AcademicYear::where('is_active', true)->update(['is_active' => false]);
            }

            $academicYear = AcademicYear::create($request->all());

            DB::commit();

            return response()->json([
                'message' => 'Tahun pelajaran berhasil ditambahkan',
                'data' => $academicYear
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menambahkan tahun pelajaran'], 500);
        }
    }

    public function show($id)
    {
        $academicYear = AcademicYear::with('tests')->findOrFail($id);
        return response()->json([
            'data' => $academicYear
        ]);
    }

    public function update(Request $request, $id)
    {
        $academicYear = AcademicYear::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:academic_years,name,' . $id,
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // If setting as active, deactivate all others
            if ($request->is_active) {
                AcademicYear::where('id', '!=', $id)
                    ->where('is_active', true)
                    ->update(['is_active' => false]);
            }

            $academicYear->update($request->all());

            DB::commit();

            return response()->json([
                'message' => 'Tahun pelajaran berhasil diupdate',
                'data' => $academicYear
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal mengupdate tahun pelajaran'], 500);
        }
    }

    public function destroy($id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        
        if ($academicYear->is_active) {
            return response()->json([
                'message' => 'Tidak dapat menghapus tahun pelajaran yang sedang aktif'
            ], 400);
        }

        $academicYear->delete();

        return response()->json([
            'message' => 'Tahun pelajaran berhasil dihapus'
        ]);
    }

    public function setActive($id)
    {
        DB::beginTransaction();
        try {
            AcademicYear::where('is_active', true)->update(['is_active' => false]);
            
            $academicYear = AcademicYear::findOrFail($id);
            $academicYear->update(['is_active' => true]);

            DB::commit();

            return response()->json([
                'message' => 'Tahun pelajaran berhasil diaktifkan',
                'data' => $academicYear
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal mengaktifkan tahun pelajaran'], 500);
        }
    }
}
