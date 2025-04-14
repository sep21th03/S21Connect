<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class CustomVerifyEmail extends Notification
{
    public function via($notifiable)
    {
        return ['mail'];
    }
    public function toMail($notifiable)
    {
        $verifyUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Xác minh địa chỉ email của bạn')
            ->line('Vui lòng nhấn vào nút bên dưới để xác minh email của bạn.')
            ->action('Xác minh email', $verifyUrl)
            ->line('Nếu bạn không tạo tài khoản thì không cần làm gì thêm.');
    }

    protected function verificationUrl($notifiable)
    {
        $temporarySignedURL = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    
        $parsed = parse_url($temporarySignedURL);
        parse_str($parsed['query'], $queryParams);
    
        $pathParts = explode('/', trim($parsed['path'], '/'));
        $id = $pathParts[count($pathParts) - 2] ?? null;
        $hash = $pathParts[count($pathParts) - 1] ?? null;
    
        $queryParams['id'] = $id;
        $queryParams['hash'] = $hash;
    
        $feBaseUrl = config('app.frontend_url');
        return $feBaseUrl . '/auth/verify-email?' . http_build_query($queryParams);
    }
    
}
