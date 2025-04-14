<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;

class ResetPasswordNotification extends BaseResetPassword
{
    public function toMail($notifiable)
    {
        $url = url('/reset-password?token=' . $this->token);

        return (new MailMessage)
            ->subject('Khôi phục mật khẩu')
            ->greeting('Xin chào ' . $notifiable->first_name . ' ' . $notifiable->last_name . '!')
            ->line('Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấn vào nút bên dưới:')
            ->action('Đặt lại mật khẩu', $url)
            ->line('Nếu bạn không yêu cầu, hãy bỏ qua email này.');
    }
}
