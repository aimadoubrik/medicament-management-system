<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Stock Alert Threshold
    |--------------------------------------------------------------------------
    |
    | The default stock level at which a LowStockNotification should be triggered
    | if a product does not have a specific threshold set.
    |
    */
    'default_stock_alert_threshold' => 5,

    /*
    |--------------------------------------------------------------------------
    | Expiry Warning Days
    |--------------------------------------------------------------------------
    |
    | The number of days before a batch's expiry date to trigger the
    | ExpiryWarningNotification via the scheduled command.
    |
    */
    'expiry_warning_days' => 30,
];