<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return AddressResource::collection($request->user()->addresses()->orderByDesc('is_default')->get());
    }

    public function store(AddressRequest $request)
    {
        $address = $this->persist($request->user()->addresses(), $request);

        return new AddressResource($address);
    }

    public function update(AddressRequest $request, Address $address)
    {
        abort_unless($address->user_id === $request->user()->id, 403);

        $this->applyDefault($request, $address);
        $address->update($request->validated());

        return new AddressResource($address);
    }

    public function destroy(Request $request, Address $address)
    {
        abort_unless($address->user_id === $request->user()->id, 403);
        $address->delete();

        return response()->json(['message' => 'Address removed.']);
    }

    protected function persist($relation, AddressRequest $request): Address
    {
        if ($request->boolean('is_default')) {
            $relation->update(['is_default' => false]);
        }

        return $relation->create($request->validated());
    }

    protected function applyDefault(Request $request, Address $address): void
    {
        if ($request->boolean('is_default')) {
            $address->user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }
    }
}
