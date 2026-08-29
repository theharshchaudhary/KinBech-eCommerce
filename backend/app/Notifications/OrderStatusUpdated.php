<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdated extends Notification
{
    use Queueable;

    public function __construct(public Order $order, public ?string $note = null) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject("Order {$this->order->order_number} is now {$this->order->status}")
            ->greeting("Hi {$notifiable->name},")
            ->line("Your order **{$this->order->order_number}** status has been updated to: **".ucfirst($this->order->status).'**.');

        if ($this->note) {
            $mail->line($this->note);
        }

        return $mail->salutation('— The '.Setting::get('general.site_name', 'KinBech').' Team');
    }
}
