<?php

namespace App\Exceptions;

use Exception; // Use the base PHP Exception class
use Throwable; // For PHP 7+ type hinting in constructor

class InsufficientStockException extends Exception
{
    /**
     * The batch that has insufficient stock (optional, but useful for context).
     *
     * @var \App\Models\Batch|null
     */
    public $batch;

    /**
     * The quantity that was attempted to be transacted.
     *
     * @var int|null
     */
    public $attemptedQuantity;

    /**
     * The quantity that is currently available.
     *
     * @var int|null
     */
    public $availableQuantity;

    /**
     * Create a new exception instance.
     *
     * @param  \App\Models\Batch|null  $batch
     */
    public function __construct(
        string $message = 'There is not enough stock available to complete this transaction.',
        int $code = 0, // You can use HTTP status codes like 422 (Unprocessable Entity) or 400 (Bad Request)
        ?Throwable $previous = null,
        $batch = null, // Keep $batch = null for flexibility if type hinting App\Models\Batch
        ?int $attemptedQuantity = null,
        ?int $availableQuantity = null
    ) {
        parent::__construct($message, $code, $previous);

        // You might need to import App\Models\Batch if you type hint it in constructor parameters
        // use App\Models\Batch;
        if ($batch instanceof \App\Models\Batch) { // Check instance if not type hinted strictly
            $this->batch = $batch;
        }
        $this->attemptedQuantity = $attemptedQuantity;
        $this->availableQuantity = $availableQuantity;
    }

    /**
     * Report the exception.
     *
     * This is a good place to add custom logging for this specific exception if needed,
     * though Laravel's default exception handler will log it anyway.
     *
     * @return bool|null
     */
    public function report()
    {
        // Example: Log additional context
        // Log::warning("Insufficient stock attempt", [
        //     'batch_id' => $this->batch ? $this->batch->id : null,
        //     'medicine_id' => $this->batch ? $this->batch->medicine_id : null,
        //     'attempted' => $this->attemptedQuantity,
        //     'available' => $this->availableQuantity,
        //     'message' => $this->getMessage(),
        // ]);

        // Return false to prevent the default logging behavior if you've handled it completely here.
        // Usually, you'd let Laravel's default handler log it.
        return null;
    }

    /**
     * Render the exception into an HTTP response.
     *
     * This method is responsible for converting the exception into an HTTP response
     * that will be sent back to the browser.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function render($request)
    {
        // If the request expects JSON (e.g., an API request)
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $this->getMessage(),
                'errors' => [
                    // You can structure errors to match Laravel's validation error format
                    // if your frontend expects that.
                    'quantity_change_input' => [$this->getMessage()], // Assuming 'quantity_change_input' is the relevant form field
                ],
            ], $this->code !== 0 ? $this->code : 422); // Default to 422 Unprocessable Entity
        }

        // For web requests, redirect back with an error message.
        // This is similar to how the controller handles it, but the exception can do it itself.
        // However, it's often cleaner to let the controller catch it and decide on the redirect.
        // If you let the controller handle it, this render method might not be strictly necessary
        // unless you want a specific error page for this exception type when not caught.

        // For demonstration, redirecting back:
        // return redirect()->back()
        //     ->withInput($request->input())
        //     ->withErrors(['quantity_change_input' => $this->getMessage()]);

        // Or, let the default Laravel handler render a standard error page.
        return response()->view('errors.500', [], 500);
    }

    /**
     * Get the batch associated with the exception.
     *
     * @return \App\Models\Batch|null
     */
    public function getBatch()
    {
        return $this->batch;
    }

    /**
     * Get the attempted transaction quantity.
     */
    public function getAttemptedQuantity(): ?int
    {
        return $this->attemptedQuantity;
    }

    /**
     * Get the available stock quantity at the time of the exception.
     */
    public function getAvailableQuantity(): ?int
    {
        return $this->availableQuantity;
    }
}
