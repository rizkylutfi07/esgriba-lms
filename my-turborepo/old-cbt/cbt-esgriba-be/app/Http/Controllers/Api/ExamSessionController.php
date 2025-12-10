<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ExamSessionController extends Controller
{
    public function index(Request $request)
    {
        $query = ExamSession::query()->where('is_active', true)->orderByRaw('COALESCE(number, 999), start_time');
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'number' => 'nullable|integer|min:1',
            'label' => 'required|string|max:100',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'duration_minutes' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $duration = $request->duration_minutes;
        if ($duration === null) {
            $duration = $this->calcDuration($request->start_time, $request->end_time);
        }

        $session = ExamSession::create([
            'number' => $request->number,
            'label' => $request->label,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'duration_minutes' => $duration,
            'is_active' => $request->get('is_active', true),
        ]);

        return response()->json(['message' => 'Session created', 'session' => $session], 201);
    }

    public function update(Request $request, $id)
    {
        $session = ExamSession::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'number' => 'nullable|integer|min:1',
            'label' => 'sometimes|required|string|max:100',
            'start_time' => 'sometimes|required|date_format:H:i',
            'end_time' => 'sometimes|required|date_format:H:i',
            'duration_minutes' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        if ((!isset($data['duration_minutes']) || $data['duration_minutes'] === null) && isset($data['start_time'], $data['end_time'])) {
            $data['duration_minutes'] = $this->calcDuration($data['start_time'], $data['end_time']);
        }

        $session->update($data);
        return response()->json(['message' => 'Session updated', 'session' => $session]);
    }

    public function destroy($id)
    {
        $session = ExamSession::findOrFail($id);
        $session->delete();
        return response()->json(['message' => 'Session deleted']);
    }

    private function calcDuration(string $start, string $end): int
    {
        $s = Carbon::createFromFormat('H:i', $start);
        $e = Carbon::createFromFormat('H:i', $end);
        if ($e->lessThanOrEqualTo($s)) {
            $e->addDay(); // handle cross-midnight, though unlikely
        }
        return $s->diffInMinutes($e);
    }
}
