<?php

namespace App\Http\Controllers\Messenger;

use App\Services\MessengerService;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class MessengerController extends Controller {
    protected $messenger;

    public function __construct(MessengerService $messenger) {
        $this->messenger = $messenger;
    }

}
