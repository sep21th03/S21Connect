<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        Mail::send('emails.contact', ['data' => $validated], function ($mail) use ($validated) {
            $mail->to('s21connect.tech@gmail.com') 
                ->subject('Liên hệ mới: ' . $validated['subject']);
        });

        return response()->json(['message' => 'Gửi thành công']);
    }
}
