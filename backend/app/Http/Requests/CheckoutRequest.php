<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'address_id' => ['required', 'exists:addresses,id'],
            'payment_method' => ['required', 'in:cod,mock_card'],
            'coupon_code' => ['nullable', 'string'],
            'customer_note' => ['nullable', 'string', 'max:1000'],
            // Only used for the simulated card flow - never touches a real payment network.
            'card_number' => ['required_if:payment_method,mock_card', 'nullable', 'string'],
            'card_expiry' => ['required_if:payment_method,mock_card', 'nullable', 'string'],
            'card_cvc' => ['required_if:payment_method,mock_card', 'nullable', 'string'],
        ];
    }
}
