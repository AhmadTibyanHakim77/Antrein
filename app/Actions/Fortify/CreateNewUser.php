<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+().\s-]+$/'],
            'address' => ['nullable', 'string', 'max:500'],
            'password' => $this->passwordRules(),
        ], [
            'phone.regex' => 'Format nomor WhatsApp tidak valid.',
        ])->validate();

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => trim($input['phone']),
            'address' => filled($input['address'] ?? null) ? trim($input['address']) : null,
            'password' => $input['password'],
        ]);
    }
}
