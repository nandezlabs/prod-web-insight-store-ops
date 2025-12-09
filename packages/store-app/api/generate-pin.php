<?php
/**
 * PIN Hash Generator
 * Run this script to generate Argon2id PIN hashes for Notion
 * 
 * Usage: php generate-pin.php [PIN]
 * Example: php generate-pin.php 1234
 */

if (php_sapi_name() !== 'cli') {
    die('This script must be run from command line');
}

$pin = $argv[1] ?? null;

if (!$pin) {
    echo "Usage: php generate-pin.php [PIN]\n";
    echo "Example: php generate-pin.php 1234\n";
    exit(1);
}

// Validate PIN format (4-6 digits)
if (!preg_match('/^\d{4,6}$/', $pin)) {
    echo "Error: PIN must be 4-6 digits\n";
    exit(1);
}

// Generate Argon2id hash
$hash = password_hash($pin, PASSWORD_ARGON2ID, [
    'memory_cost' => 65536,  // 64 MB
    'time_cost' => 4,         // 4 iterations
    'threads' => 2            // 2 parallel threads
]);

if ($hash === false) {
    echo "Error: Failed to generate hash\n";
    exit(1);
}

echo "\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "PIN Hash Generated Successfully\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "\n";
echo "PIN: $pin\n";
echo "\n";
echo "Hash (copy this to Notion):\n";
echo "$hash\n";
echo "\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "\n";
echo "Add this to your Notion Store Profile database:\n";
echo "• Store ID: STORE-XXX (your store ID)\n";
echo "• PIN Hash: $hash\n";
echo "\n";

// Verify the hash works
if (password_verify($pin, $hash)) {
    echo "✓ Hash verified successfully\n";
} else {
    echo "✗ Warning: Hash verification failed\n";
}

echo "\n";
