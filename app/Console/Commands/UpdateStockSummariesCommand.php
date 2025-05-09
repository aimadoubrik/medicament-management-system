<?php

// app/Console/Commands/UpdateStockSummariesCommand.php

namespace App\Console\Commands;

use App\Models\Medicine;
use App\Services\StockManagementService;
use Illuminate\Console\Command;

class UpdateStockSummariesCommand extends Command
{
    protected $stockManagementService;

    public function __construct(StockManagementService $stockManagementService)
    {
        parent::__construct(); // Call the parent constructor
        $this->stockManagementService = $stockManagementService;
    }

    protected $signature = 'update:stock-summaries';

    public function handle()
    {
        // Paste the code here
        $medicinesWithoutStockSummary = Medicine::doesntHave('medicineStockSummaries')->get();

        $medicinesWithoutStockSummary->each(function ($medicine) {
            $this->stockManagementService->updateMedicineStockSummary($medicine);
        });
    }
}
