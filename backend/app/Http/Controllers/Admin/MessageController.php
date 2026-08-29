<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $query = ContactMessage::query();

        if ($request->filled('status')) {
            $query->where('is_read', $request->status === 'read');
        }

        return $query->latest()->paginate($request->get('per_page', 15));
    }

    public function show(ContactMessage $message)
    {
        $message->update(['is_read' => true]);

        return $message;
    }

    public function destroy(ContactMessage $message)
    {
        $message->delete();

        return response()->json(['message' => 'Message deleted.']);
    }
}
