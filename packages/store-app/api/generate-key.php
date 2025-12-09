<?php
/**
 * Encryption Key Generator
 * Generates a secure 32-byte encryption key for AES-256-GCM
 * 
 * Usage: php generate-key.php
 */

if (php_sapi_name() !== 'cli') {
    die('This script must be run from command line');
}

// Generate 32 random bytes
$key = random_bytes(32);
$keyBase64 = base64_encode($key);

echo "\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "Encryption Key Generated\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "\n";
echo "Add this to your environment variables:\n";
echo "\n";
echo "ENCRYPTION_KEY=$keyBase64\n";
echo "\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "\n";
echo "⚠️  IMPORTANT SECURITY NOTES:\n";
echo "• Keep this key secret - never commit to version control\n";
echo "• Store in Hostinger environment variables only\n";
echo "• Losing this key will invalidate all session tokens\n";
echo "• Use a different key for each environment (dev/prod)\n";
echo "\n";
