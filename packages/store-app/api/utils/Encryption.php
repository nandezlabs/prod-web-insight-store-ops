<?php
/**
 * Encryption Utility
 * Provides AES-256-GCM encryption/decryption
 */

class Encryption {
    private const CIPHER = 'aes-256-gcm';
    private const TAG_LENGTH = 16;
    
    /**
     * Encrypt data using AES-256-GCM
     * 
     * @param string $data Data to encrypt
     * @param string $key Base64-encoded 32-byte key
     * @return string|false Base64-encoded encrypted data with IV and tag, or false on failure
     */
    public static function encrypt($data, $key) {
        try {
            // Decode the key from base64
            $keyDecoded = base64_decode($key);
            
            if (strlen($keyDecoded) !== 32) {
                error_log("Encryption key must be 32 bytes");
                return false;
            }
            
            // Generate random IV (12 bytes recommended for GCM)
            $iv = openssl_random_pseudo_bytes(12);
            
            // Encrypt the data
            $tag = '';
            $ciphertext = openssl_encrypt(
                $data,
                self::CIPHER,
                $keyDecoded,
                OPENSSL_RAW_DATA,
                $iv,
                $tag,
                '',
                self::TAG_LENGTH
            );
            
            if ($ciphertext === false) {
                error_log("Encryption failed");
                return false;
            }
            
            // Combine IV + ciphertext + tag and encode
            $encrypted = base64_encode($iv . $ciphertext . $tag);
            
            return $encrypted;
        } catch (Exception $e) {
            error_log("Encryption error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Decrypt data using AES-256-GCM
     * 
     * @param string $encryptedData Base64-encoded encrypted data
     * @param string $key Base64-encoded 32-byte key
     * @return string|false Decrypted data or false on failure
     */
    public static function decrypt($encryptedData, $key) {
        try {
            // Decode the key from base64
            $keyDecoded = base64_decode($key);
            
            if (strlen($keyDecoded) !== 32) {
                error_log("Encryption key must be 32 bytes");
                return false;
            }
            
            // Decode the encrypted data
            $decoded = base64_decode($encryptedData);
            
            if ($decoded === false) {
                error_log("Failed to decode encrypted data");
                return false;
            }
            
            // Extract IV (12 bytes), ciphertext, and tag (16 bytes)
            $iv = substr($decoded, 0, 12);
            $tag = substr($decoded, -self::TAG_LENGTH);
            $ciphertext = substr($decoded, 12, -self::TAG_LENGTH);
            
            // Decrypt the data
            $plaintext = openssl_decrypt(
                $ciphertext,
                self::CIPHER,
                $keyDecoded,
                OPENSSL_RAW_DATA,
                $iv,
                $tag
            );
            
            if ($plaintext === false) {
                error_log("Decryption failed");
                return false;
            }
            
            return $plaintext;
        } catch (Exception $e) {
            error_log("Decryption error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Generate a random encryption key
     * 
     * @return string Base64-encoded 32-byte key
     */
    public static function generateKey() {
        $key = openssl_random_pseudo_bytes(32);
        return base64_encode($key);
    }
    
    /**
     * Generate a secure random token
     * 
     * @param int $length Length in bytes
     * @return string Hex-encoded token
     */
    public static function generateToken($length = 64) {
        $bytes = openssl_random_pseudo_bytes($length);
        return bin2hex($bytes);
    }
}
