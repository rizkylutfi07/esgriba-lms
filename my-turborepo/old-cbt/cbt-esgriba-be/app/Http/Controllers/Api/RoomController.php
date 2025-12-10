<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::withCount('tests')
            ->orderBy('building')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $rooms
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:20|unique:rooms',
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'floor' => 'nullable|max:50',
            'building' => 'nullable|string|max:100',
            'facilities' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room = Room::create($request->all());

        return response()->json([
            'message' => 'Ruangan berhasil ditambahkan',
            'data' => $room
        ], 201);
    }

    public function show($id)
    {
        $room = Room::with('tests')->findOrFail($id);
        return response()->json([
            'data' => $room
        ]);
    }

    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:20|unique:rooms,code,' . $id,
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'floor' => 'nullable|max:50',
            'building' => 'nullable|string|max:100',
            'facilities' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room->update($request->all());

        return response()->json([
            'message' => 'Ruangan berhasil diupdate',
            'data' => $room
        ]);
    }

    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        $room->delete();

        return response()->json([
            'message' => 'Ruangan berhasil dihapus'
        ]);
    }
}
