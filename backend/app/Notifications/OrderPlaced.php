<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPlaced extends Notification
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $currency = Setting::get('general.currency_symbol', 'Rs.');

        return (new MailMessage)
            ->subject("Order Confirmed - {$this->order->order_number}")
            ->greeting("Thank you for your order, {$notifiable->name}!")
            ->line("Your order **{$this->order->order_number}** has been placed successfully.")
            ->line("Total: {$currency} ".number_format((float) $this->order->total, 2))
            ->line('Payment method: '.strtoupper(str_replace('_', ' ', $this->order->payment_method)))
            ->line('We will notify you as soon as your order ships.')
            ->salutation('— The '.Setting::get('general.site_name', 'KinBech').' Team');
    }
}
