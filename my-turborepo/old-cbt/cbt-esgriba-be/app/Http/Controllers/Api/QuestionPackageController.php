<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuestionPackage;
use App\Models\QuestionBank;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class QuestionPackageController extends Controller
{
    /**
     * Get all packages
     */
    public function index(Request $request)
    {
        $query = QuestionPackage::with(['subject', 'creator', 'questions']);

        // Visibility for guru: own packages OR packages for subjects they teach (e.g., created by admin)
        if ($request->user()->isGuru() && !$request->user()->isAdmin()) {
            // Get subject IDs assigned to this teacher
            $subjectIds = $request->user()->subjects()->pluck('subjects.id');

            $query->where(function ($q) use ($request, $subjectIds) {
                // Always include own packages
                $q->where('created_by', $request->user()->id);

                // Also include packages that match teacher subjects
                if ($subjectIds->count() > 0) {
                    $q->orWhereIn('subject_id', $subjectIds);
                }
            });
        }

        // Filter by subject
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        // Filter by difficulty
        if ($request->has('difficulty_level')) {
            $query->where('difficulty_level', $request->difficulty_level);
        }

        // Filter by teacher (including admin-created packages for teacher subjects)
        if ($request->has('teacher_id')) {
            $teacherId = (int) $request->teacher_id;
            $subjectIds = collect();

            $teacher = User::find($teacherId);
            if ($teacher && method_exists($teacher, 'subjects')) {
                $subjectIds = $teacher->subjects()->pluck('subjects.id');
            }

            $query->where(function ($q) use ($teacherId, $subjectIds) {
                $q->where('created_by', $teacherId);

                if ($subjectIds->count() > 0) {
                    $q->orWhere(function ($subQuery) use ($subjectIds) {
                        $subQuery
                            ->whereIn('subject_id', $subjectIds)
                            ->whereHas('creator', function ($creatorQuery) {
                                $creatorQuery->where('role', 'admin');
                            });
                    });
                }
            });
        } elseif ($request->has('creator_id')) {
            $query->where('created_by', $request->creator_id);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $packages = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json($packages);
    }

    /**
     * Store a new package
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'difficulty_level' => 'required|in:easy,medium,hard',
            'teacher_id' => 'nullable|exists:users,id',
            'question_ids' => 'nullable|array',
            'question_ids.*' => 'exists:question_banks,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Determine creator: if admin provides teacher_id, use it; otherwise use current user
        $createdBy = $request->user()->id;
        if ($request->user()->isAdmin() && $request->has('teacher_id') && $request->teacher_id) {
            $createdBy = $request->teacher_id;
        }

        $package = QuestionPackage::create([
            'name' => $request->name,
            'description' => $request->description,
            'subject_id' => $request->subject_id,
            'difficulty_level' => $request->difficulty_level,
            'created_by' => $createdBy,
        ]);

        // Attach questions if provided
        if ($request->has('question_ids') && is_array($request->question_ids)) {
            foreach ($request->question_ids as $index => $questionId) {
                $package->questions()->attach($questionId, ['order' => $index]);
            }
            $package->updateStatistics();
        }

        $package->load(['subject', 'creator', 'questions']);

        return response()->json([
            'message' => 'Package created successfully',
            'data' => $package,
        ], 201);
    }

    /**
     * Show a specific package
     */
    public function show($id)
    {
        $package = QuestionPackage::with(['subject', 'creator', 'questions'])
            ->findOrFail($id);

        return response()->json([
            'data' => $package
        ]);
    }

    /**
     * Update a package
     */
    public function update(Request $request, $id)
    {
        $package = QuestionPackage::findOrFail($id);

        // Check permission
        if ($package->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'sometimes|required|exists:subjects,id',
            'difficulty_level' => 'sometimes|required|in:easy,medium,hard',
            'teacher_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateData = $request->only(['name', 'description', 'subject_id', 'difficulty_level']);
        
        // If admin updates teacher_id, change created_by
        if ($request->user()->isAdmin() && $request->has('teacher_id')) {
            $updateData['created_by'] = $request->teacher_id ?: $request->user()->id;
        }

        $package->update($updateData);
        $package->load(['subject', 'creator', 'questions']);

        return response()->json([
            'message' => 'Package updated successfully',
            'data' => $package,
        ]);
    }

    /**
     * Delete a package
     */
    public function destroy(Request $request, $id)
    {
        $package = QuestionPackage::findOrFail($id);

        // Check permission
        if ($package->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $package->delete();

        return response()->json([
            'message' => 'Package deleted successfully'
        ]);
    }

    /**
     * Add questions to package
     */
    public function addQuestions(Request $request, $id)
    {
        $package = QuestionPackage::findOrFail($id);

        // Check permission
        if ($package->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'question_ids' => 'required|array',
            'question_ids.*' => 'exists:question_banks,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Get current max order
        $maxOrder = $package->questions()->max('package_questions.order') ?? -1;

        // Attach new questions
        foreach ($request->question_ids as $index => $questionId) {
            // Check if already attached
            if (!$package->questions()->where('question_id', $questionId)->exists()) {
                $package->questions()->attach($questionId, ['order' => $maxOrder + $index + 1]);
            }
        }

        $package->updateStatistics();
        $package->load(['subject', 'creator', 'questions']);

        return response()->json([
            'message' => 'Questions added successfully',
            'data' => $package,
        ]);
    }

    /**
     * Remove question from package
     */
    public function removeQuestion(Request $request, $packageId, $questionId)
    {
        $package = QuestionPackage::findOrFail($packageId);

        // Check permission
        if ($package->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $package->questions()->detach($questionId);
        $package->updateStatistics();

        return response()->json([
            'message' => 'Question removed successfully'
        ]);
    }

    /**
     * Reorder questions in package
     */
    public function reorderQuestions(Request $request, $id)
    {
        $package = QuestionPackage::findOrFail($id);

        // Check permission
        if ($package->created_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'question_orders' => 'required|array',
            'question_orders.*.question_id' => 'required|exists:question_banks,id',
            'question_orders.*.order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach ($request->question_orders as $item) {
            $package->questions()->updateExistingPivot($item['question_id'], [
                'order' => $item['order']
            ]);
        }

        $package->load(['questions']);

        return response()->json([
            'message' => 'Questions reordered successfully',
            'data' => $package,
        ]);
    }

    /**
     * Duplicate a package
     */
    public function duplicate($id)
    {
        $package = QuestionPackage::with('questions')->findOrFail($id);

        $newPackage = QuestionPackage::create([
            'name' => $package->name . ' (Copy)',
            'description' => $package->description,
            'subject_id' => $package->subject_id,
            'difficulty_level' => $package->difficulty_level,
            'created_by' => request()->user()->id,
        ]);

        // Copy questions
        foreach ($package->questions as $question) {
            $newPackage->questions()->attach($question->id, [
                'order' => $question->pivot->order
            ]);
        }

        $newPackage->updateStatistics();
        $newPackage->load(['subject', 'creator', 'questions']);

        return response()->json([
            'message' => 'Package duplicated successfully',
            'data' => $newPackage,
        ]);
    }

    /**
     * Parse DOCX file and extract questions (server-side)
     */
    public function parseDocx(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:docx|max:10240', // Max 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $filePath = $file->path();
            $phpWord = \PhpOffice\PhpWord\IOFactory::load($filePath);

            // Extract media files from DOCX (it's a ZIP file)
            $mediaFiles = $this->extractMediaFromDocx($filePath);

            $questions = [];
            $currentQuestion = null;
            $currentSection = null;
            $optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
            $optionIndex = 0;

            // Debug collections for response
            $debugElements = [];
            $debugAllText = [];

            // Store images found in document
            $imageCounter = 0;
            foreach ($phpWord->getSections() as $section) {
                foreach ($section->getElements() as $element) {
                    $elementClass = get_class($element);
                    $debugElements[] = $elementClass;

                    // Capture raw text for debugging, without relying on logs
                    $rawText = $this->extractGenericText($element);
                    if ($rawText !== '') {
                        $debugAllText[] = [
                            'type' => $elementClass,
                            'text' => $rawText
                        ];
                    }

                    // Handle TextRun (paragraphs) - may contain text and images
                    if ($elementClass === 'PhpOffice\PhpWord\Element\TextRun') {
                        $result = $this->extractTextAndImagesFromTextRun($element, $currentQuestion, $currentSection, $imageCounter, $mediaFiles);
                        $text = $result['text'];
                        if (!empty($text)) {
                            $this->processLine($text, $currentQuestion, $currentSection, $optionIndex, $optionLabels, $questions);
                        }
                    }
                    // Handle plain Text
                    elseif ($elementClass === 'PhpOffice\PhpWord\Element\Text') {
                        if (method_exists($element, 'getText')) {
                            /** @var \PhpOffice\PhpWord\Element\Text $element */
                            $text = $element->getText();
                            $this->processLine($text, $currentQuestion, $currentSection, $optionIndex, $optionLabels, $questions);
                        }
                    }
                    // Handle Image elements
                    elseif ($elementClass === 'PhpOffice\PhpWord\Element\Image') {
                        $imageData = $this->extractImageAsBase64($element, $mediaFiles);
                        if ($imageData && $currentQuestion && $currentSection) {
                            // Append image to current section
                            $imageTag = '<img src="' . $imageData . '" style="max-width:100%;height:auto;" />';

                            if ($currentSection === 'SOAL') {
                                $currentQuestion['question'] .= ' ' . $imageTag;
                            } elseif ($currentSection === 'JAWABAN' && $optionIndex > 0 && $optionIndex <= count($optionLabels)) {
                                $label = $optionLabels[$optionIndex - 1];
                                if (isset($currentQuestion['options'][$label])) {
                                    $currentQuestion['options'][$label] .= ' ' . $imageTag;
                                }
                            } elseif ($currentSection === 'KUNCI') {
                                $currentQuestion['correctAnswer'] .= ' ' . $imageTag;
                            }
                        }
                    }
                    // Handle Table (might contain questions)
                    elseif ($elementClass === 'PhpOffice\PhpWord\Element\Table') {
                        $tableText = $this->extractGenericText($element);
                        // Process each line from table
                        $lines = explode("\n", $tableText);
                        foreach ($lines as $line) {
                            $this->processLine($line, $currentQuestion, $currentSection, $optionIndex, $optionLabels, $questions);
                        }
                    }
                    // Handle ListItemRun (bullet/numbered lists - the actual type used by PHPWord)
                    elseif ($elementClass === 'PhpOffice\PhpWord\Element\ListItemRun') {
                        $result = $this->extractTextAndImagesFromTextRun($element, $currentQuestion, $currentSection, $imageCounter, $mediaFiles);
                        $text = $result['text'];

                        // Detect if it's an option (A., B., C., etc.)
                        if (preg_match('/^([A-F])[\s.)\-:]+(.+)/i', $text, $match)) {
                            $label = strtoupper($match[1]);
                            $value = trim($match[2]);

                            if ($currentQuestion && isset($currentQuestion['options'])) {
                                $currentQuestion['options'][$label] = $value;
                            }
                        } else {
                            if (!empty($text)) {
                                $this->processLine($text, $currentQuestion, $currentSection, $optionIndex, $optionLabels, $questions);
                            }
                        }
                    }
                    // Handle ListItem (alternative type - keep for compatibility)
                    elseif ($elementClass === 'PhpOffice\PhpWord\Element\ListItem') {
                        $text = $this->extractTextFromListItem($element);

                        // Detect if it's an option (A., B., C., etc.)
                        if (preg_match('/^([A-F])[\s.)\-:]+(.+)/i', $text, $match)) {
                            $label = strtoupper($match[1]);
                            $value = trim($match[2]);

                            if ($currentQuestion && isset($currentQuestion['options'])) {
                                $currentQuestion['options'][$label] = $value;
                            }
                        } else {
                            $this->processLine($text, $currentQuestion, $currentSection, $optionIndex, $optionLabels, $questions);
                        }
                    }
                }
            }

            // Add last question if exists
            if ($currentQuestion && $this->isValidQuestion($currentQuestion)) {
                $questions[] = $this->formatQuestion($currentQuestion);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'questions' => $questions,
                    'total' => count($questions),
                    'valid' => count(array_filter($questions, fn($q) => $q['valid'])),
                    'invalid' => count(array_filter($questions, fn($q) => !$q['valid'])),
                ],
                'debug' => [
                    'elements_found' => $debugElements,
                    'unique_element_types' => array_count_values($debugElements),
                    'all_text' => $debugAllText,
                    'images_extracted' => $imageCounter,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error parsing DOCX file: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Extract text from TextRun element
     */
    private function extractTextFromTextRun($textRun)
    {
        $text = '';
        foreach ($textRun->getElements() as $element) {
            if (method_exists($element, 'getText')) {
                $text .= $element->getText();
            }
        }
        return trim($text);
    }

    /**
     * Extract text and images from TextRun element
     */
    private function extractTextAndImagesFromTextRun($textRun, &$currentQuestion, &$currentSection, &$imageCounter, $mediaFiles = [])
    {
        $text = '';
        $images = [];

        foreach ($textRun->getElements() as $element) {
            $elementClass = get_class($element);

            // Handle text elements
            if (method_exists($element, 'getText')) {
                $text .= $element->getText();
            }

            // Handle image elements (check multiple possible classes)
            if (
                strpos($elementClass, 'Image') !== false ||
                $elementClass === 'PhpOffice\PhpWord\Element\Image' ||
                method_exists($element, 'getSource') ||
                method_exists($element, 'getImageStringData')
            ) {

                $imageData = $this->extractImageAsBase64($element, $mediaFiles);
                if ($imageData) {
                    $imageTag = '<img src="' . $imageData . '" style="max-width:100%;height:auto;" />';
                    $images[] = $imageTag;
                    $imageCounter++;
                    \Illuminate\Support\Facades\Log::info('Image found and extracted in TextRun', [
                        'element_class' => $elementClass,
                        'image_size' => strlen($imageData)
                    ]);
                }
            }
        }

        // Combine text and images
        $combined = trim($text);
        if (!empty($images)) {
            $combined .= ' ' . implode(' ', $images);
        }

        return [
            'text' => $combined,
            'images' => $images
        ];
    }

    /**
     * Extract media files from DOCX (it's a ZIP archive)
     */
    private function extractMediaFromDocx($filePath)
    {
        $mediaFiles = [];

        try {
            $zip = new \ZipArchive();
            if ($zip->open($filePath) === true) {
                // Extract all files from word/media/ folder
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $filename = $zip->getNameIndex($i);

                    // Check if file is in media folder
                    if (strpos($filename, 'word/media/') === 0) {
                        $imageData = $zip->getFromIndex($i);
                        $basename = basename($filename);
                        $mediaFiles[$basename] = $imageData;

                        \Illuminate\Support\Facades\Log::info('Extracted media file from ZIP', [
                            'filename' => $basename,
                            'size' => strlen($imageData)
                        ]);
                    }
                }
                $zip->close();
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to extract media from DOCX: ' . $e->getMessage());
        }

        return $mediaFiles;
    }

    /**
     * Extract image as base64 data URL
     */
    private function extractImageAsBase64($imageElement, &$mediaFiles = [])
    {
        try {
            \Illuminate\Support\Facades\Log::info('Attempting to extract image from element: ' . get_class($imageElement));

            // Method 1: Try to get image source filename directly
            if (method_exists($imageElement, 'getSource')) {
                $imagePath = $imageElement->getSource();
                \Illuminate\Support\Facades\Log::info('Image source path: ' . $imagePath);

                // Extract basename to match with media files
                $basename = basename($imagePath);

                // First, try to find in extracted media files
                if (isset($mediaFiles[$basename])) {
                    $imageData = $mediaFiles[$basename];
                    $base64 = base64_encode($imageData);

                    // Detect mime type from data
                    $finfo = new \finfo(FILEINFO_MIME_TYPE);
                    $mimeType = $finfo->buffer($imageData);

                    \Illuminate\Support\Facades\Log::info('Image extracted from media folder via source', [
                        'filename' => $basename,
                        'mime_type' => $mimeType,
                        'size' => strlen($imageData)
                    ]);

                    return 'data:' . $mimeType . ';base64,' . $base64;
                }

                // Second, try to read from ZIP path directly (zip://path#file format)
                // PHPWord returns paths like: zip://C:\Temp\phpXXX.tmp#word/media/image1.jpeg
                if (strpos($imagePath, 'zip://') === 0 && file_exists($imagePath)) {
                    $imageData = file_get_contents($imagePath);
                    if ($imageData !== false) {
                        $base64 = base64_encode($imageData);

                        // Detect mime type from data
                        $finfo = new \finfo(FILEINFO_MIME_TYPE);
                        $mimeType = $finfo->buffer($imageData);

                        \Illuminate\Support\Facades\Log::info('Image extracted from ZIP path', [
                            'path' => $imagePath,
                            'mime_type' => $mimeType,
                            'size' => strlen($imageData)
                        ]);

                        return 'data:' . $mimeType . ';base64,' . $base64;
                    }
                }

                // Third, check if file exists as external file
                if (file_exists($imagePath) && is_readable($imagePath)) {
                    $imageData = file_get_contents($imagePath);
                    $base64 = base64_encode($imageData);

                    // Detect mime type
                    $finfo = finfo_open(FILEINFO_MIME_TYPE);
                    $mimeType = finfo_file($finfo, $imagePath);
                    finfo_close($finfo);

                    \Illuminate\Support\Facades\Log::info('Image extracted from external file path', [
                        'mime_type' => $mimeType,
                        'size' => strlen($imageData)
                    ]);

                    return 'data:' . $mimeType . ';base64,' . $base64;
                }
            }

            // Method 2: Try to match by image type and search in media files
            // If we have media files, try to use them based on image counter or type
            if (!empty($mediaFiles)) {
                \Illuminate\Support\Facades\Log::info('Attempting to find image in media files', [
                    'media_count' => count($mediaFiles),
                    'media_files' => array_keys($mediaFiles)
                ]);

                // Just get the first unused image (simple approach)
                foreach ($mediaFiles as $filename => $imageData) {
                    if (!empty($imageData)) {
                        $base64 = base64_encode($imageData);

                        // Detect mime type from data
                        $finfo = new \finfo(FILEINFO_MIME_TYPE);
                        $mimeType = $finfo->buffer($imageData);

                        \Illuminate\Support\Facades\Log::info('Image extracted from media folder (first match)', [
                            'filename' => $filename,
                            'mime_type' => $mimeType,
                            'size' => strlen($imageData)
                        ]);

                        // Remove used file to avoid reuse
                        unset($mediaFiles[$filename]);

                        return 'data:' . $mimeType . ';base64,' . $base64;
                    }
                }
            }

            \Illuminate\Support\Facades\Log::warning('No image data found in element or media files');
        } catch (\Exception $e) {
            // Log error but continue parsing
            \Illuminate\Support\Facades\Log::warning('Failed to extract image: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Extract text from ListItem element
     */
    private function extractTextFromListItem($listItem)
    {
        $text = '';

        // Try different methods to extract text
        if (method_exists($listItem, 'getTextObject')) {
            $textObject = $listItem->getTextObject();
            if ($textObject && method_exists($textObject, 'getText')) {
                $text = $textObject->getText();
            }
        }

        if (empty($text) && method_exists($listItem, 'getText')) {
            $text = $listItem->getText();
        }

        // Try to get elements if available
        if (empty($text) && method_exists($listItem, 'getElements')) {
            foreach ($listItem->getElements() as $element) {
                if (method_exists($element, 'getText')) {
                    $text .= $element->getText();
                }
            }
        }

        return trim($text);
    }

    /**
     * Extract generic text from any PHPWord element for debugging purposes.
     */
    private function extractGenericText($element)
    {
        $segments = [];

        if (method_exists($element, 'getText')) {
            $segments[] = $element->getText();
        }

        $class = get_class($element);

        if (in_array($class, [
            'PhpOffice\\PhpWord\\Element\\TextRun',
            'PhpOffice\\PhpWord\\Element\\ListItemRun'
        ], true)) {
            $segments[] = $this->extractTextFromTextRun($element);
        }

        if ($class === 'PhpOffice\\PhpWord\\Element\\ListItem') {
            $segments[] = $this->extractTextFromListItem($element);
        }

        if ($class === 'PhpOffice\\PhpWord\\Element\\Table') {
            foreach ($element->getRows() as $row) {
                foreach ($row->getCells() as $cell) {
                    foreach ($cell->getElements() as $cellElement) {
                        $segments[] = $this->extractGenericText($cellElement);
                    }
                }
            }
        }

        if (method_exists($element, 'getElements')) {
            foreach ($element->getElements() as $child) {
                $segments[] = $this->extractGenericText($child);
            }
        }

        $segments = array_filter(array_map(fn($item) => trim((string)$item), $segments));

        return trim(implode(' ', $segments));
    }

    /**
     * Process a line of text and update current question
     */
    private function processLine($text, &$currentQuestion, &$currentSection, &$optionIndex, $optionLabels, &$questions)
    {
        $text = trim($text);
        if (empty($text)) return;

        // Detect [NOMOR x]
        if (preg_match('/^\[NOMOR\s+(\d+)\]/i', $text, $match)) {
            // Save previous question
            if ($currentQuestion && $this->isValidQuestion($currentQuestion)) {
                $questions[] = $this->formatQuestion($currentQuestion);
            }

            // Start new question
            $currentQuestion = [
                'number' => (int)$match[1],
                'type' => null,
                'points' => 0,
                'question' => '',
                'options' => [],
                'correctAnswer' => '',
                'errors' => []
            ];
            $currentSection = null;
            $optionIndex = 0;
            return;
        }

        if (!$currentQuestion) return;

        // Detect JENIS SOAL
        if (preg_match('/^JENIS\s+SOAL\s*:\s*(PG|ESSAY)/i', $text, $match)) {
            $currentQuestion['type'] = strtoupper($match[1]);
            return;
        }

        // Detect NILAI
        if (preg_match('/^NILAI\s*:\s*(\d+)/i', $text, $match)) {
            $currentQuestion['points'] = (int)$match[1];
            return;
        }

        // Detect SOAL
        if (preg_match('/^SOAL\s*:/i', $text)) {
            $currentSection = 'SOAL';
            // Get text after "SOAL:"
            $soalText = trim(preg_replace('/^SOAL\s*:/i', '', $text));
            if (!empty($soalText)) {
                $currentQuestion['question'] = $soalText;
            }
            return;
        }

        // Detect JAWABAN (for PG)
        if (preg_match('/^JAWABAN\s*:/i', $text)) {
            $currentSection = 'JAWABAN';
            $optionIndex = 0;
            return;
        }

        // Detect KUNCI JAWABAN
        if (preg_match('/^KUNCI\s+JAWABAN\s*:(.*)$/i', $text, $match)) {
            $answerText = trim($match[1]);

            if (!empty($currentQuestion['type']) && strtoupper($currentQuestion['type']) === 'PG') {
                if (preg_match('/^[A-F]/i', $answerText, $choiceMatch)) {
                    $currentQuestion['correctAnswer'] = strtoupper($choiceMatch[0]);
                }
                $currentSection = null;
            } else {
                if ($answerText !== '') {
                    $currentQuestion['correctAnswer'] = $answerText;
                }
                $currentSection = 'KUNCI';
            }
            return;
        }

        // Detect options (A., B., C., etc.)
        if ($currentSection === 'JAWABAN' && preg_match('/^([A-F])[\s.)\-:]+(.+)/i', $text, $match)) {
            $label = strtoupper($match[1]);
            $value = trim($match[2]);
            $currentQuestion['options'][$label] = $value;
            return;
        }

        // Append to current section
        if ($currentSection === 'SOAL') {
            $currentQuestion['question'] .= ' ' . $text;
        } elseif ($currentSection === 'JAWABAN' && $optionIndex < count($optionLabels)) {
            // Fallback: treat as next option if no label
            $currentQuestion['options'][$optionLabels[$optionIndex]] = $text;
            $optionIndex++;
        } elseif ($currentSection === 'KUNCI') {
            $separator = empty($currentQuestion['correctAnswer']) ? '' : ' ';
            $currentQuestion['correctAnswer'] .= $separator . $text;
        }
    }

    /**
     * Check if question is valid
     */
    private function isValidQuestion($question)
    {
        if (empty($question['type']) || empty($question['question'])) {
            return false;
        }

        if ($question['type'] === 'PG') {
            return !empty($question['options']['A']) &&
                !empty($question['options']['B']) &&
                !empty($question['correctAnswer']);
        }

        if ($question['type'] === 'ESSAY') {
            return !empty($question['correctAnswer']);
        }

        return false;
    }

    /**
     * Format question for response
     */
    private function formatQuestion($question)
    {
        $errors = [];

        // Validate question
        if (empty($question['question'])) {
            $errors[] = 'Soal kosong';
        }
        if (empty($question['type'])) {
            $errors[] = 'Jenis soal tidak ditemukan';
        }
        if ($question['points'] <= 0) {
            $errors[] = 'Nilai tidak valid';
        }

        if ($question['type'] === 'PG') {
            if (empty($question['options']['A'])) $errors[] = 'Pilihan A tidak ditemukan';
            if (empty($question['options']['B'])) $errors[] = 'Pilihan B tidak ditemukan';
            if (empty($question['options']['C'])) $errors[] = 'Pilihan C tidak ditemukan';
            if (empty($question['options']['D'])) $errors[] = 'Pilihan D tidak ditemukan';
        }

        if (empty($question['correctAnswer'])) {
            $errors[] = 'Kunci jawaban tidak ditemukan';
        }

        return [
            'valid' => count($errors) === 0,
            'rowNumber' => $question['number'],
            'question_type' => $question['type'],
            'question_text' => trim($question['question']),
            'option_a' => $question['options']['A'] ?? '',
            'option_b' => $question['options']['B'] ?? '',
            'option_c' => $question['options']['C'] ?? '',
            'option_d' => $question['options']['D'] ?? '',
            'option_e' => $question['options']['E'] ?? '',
            'correct_answer' => $question['correctAnswer'],
            'points' => $question['points'],
            'category' => 'Umum',
            'difficulty' => 'sedang',
            'errors' => $errors
        ];
    }
}
