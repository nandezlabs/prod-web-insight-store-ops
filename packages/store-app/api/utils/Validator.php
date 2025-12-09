<?php
/**
 * Input Validator
 * Validates and sanitizes input data
 */

class Validator {
    /**
     * Validate and sanitize store ID
     * 
     * @param mixed $storeId
     * @return string|false Sanitized store ID or false
     */
    public static function validateStoreId($storeId) {
        if (!is_string($storeId)) {
            return false;
        }
        
        // Remove whitespace and convert to uppercase
        $storeId = trim(strtoupper($storeId));
        
        // Store ID format: STORE-XXX (letters, numbers, hyphens only)
        if (!preg_match('/^[A-Z0-9\-]+$/', $storeId)) {
            return false;
        }
        
        if (strlen($storeId) > 50) {
            return false;
        }
        
        return $storeId;
    }
    
    /**
     * Validate PIN (4-6 digits)
     * 
     * @param mixed $pin
     * @return string|false Sanitized PIN or false
     */
    public static function validatePin($pin) {
        if (!is_string($pin) && !is_numeric($pin)) {
            return false;
        }
        
        $pin = trim((string)$pin);
        
        // PIN must be 4-6 digits only
        if (!preg_match('/^\d{4,6}$/', $pin)) {
            return false;
        }
        
        return $pin;
    }
    
    /**
     * Validate latitude
     * 
     * @param mixed $latitude
     * @return float|false Validated latitude or false
     */
    public static function validateLatitude($latitude) {
        if (!is_numeric($latitude)) {
            return false;
        }
        
        $lat = (float)$latitude;
        
        if ($lat < -90 || $lat > 90) {
            return false;
        }
        
        return $lat;
    }
    
    /**
     * Validate longitude
     * 
     * @param mixed $longitude
     * @return float|false Validated longitude or false
     */
    public static function validateLongitude($longitude) {
        if (!is_numeric($longitude)) {
            return false;
        }
        
        $lon = (float)$longitude;
        
        if ($lon < -180 || $lon > 180) {
            return false;
        }
        
        return $lon;
    }
    
    /**
     * Validate session token (hex string)
     * 
     * @param mixed $token
     * @return string|false Validated token or false
     */
    public static function validateSessionToken($token) {
        if (!is_string($token)) {
            return false;
        }
        
        $token = trim($token);
        
        // Session token should be hex-encoded (128 characters for 64 bytes)
        if (!preg_match('/^[a-f0-9]{128}$/i', $token)) {
            return false;
        }
        
        return strtolower($token);
    }
    
    /**
     * Validate Notion page/database ID
     * 
     * @param mixed $id
     * @return string|false Validated ID or false
     */
    public static function validateNotionId($id) {
        if (!is_string($id)) {
            return false;
        }
        
        $id = trim($id);
        
        // Notion IDs are 32 characters (with or without hyphens)
        $id = str_replace('-', '', $id);
        
        if (!preg_match('/^[a-f0-9]{32}$/i', $id)) {
            return false;
        }
        
        return $id;
    }
    
    /**
     * Sanitize general string input
     * 
     * @param mixed $input
     * @param int $maxLength
     * @return string Sanitized string
     */
    public static function sanitizeString($input, $maxLength = 1000) {
        if (!is_string($input)) {
            return '';
        }
        
        $input = trim($input);
        $input = substr($input, 0, $maxLength);
        $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
        
        return $input;
    }
    
    /**
     * Validate JSON structure
     * 
     * @param string $json
     * @return array|false Decoded array or false
     */
    public static function validateJson($json) {
        if (!is_string($json)) {
            return false;
        }
        
        $data = json_decode($json, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return false;
        }
        
        return $data;
    }
    
    /**
     * Calculate distance between two coordinates (Haversine formula)
     * 
     * @param float $lat1 Latitude 1
     * @param float $lon1 Longitude 1
     * @param float $lat2 Latitude 2
     * @param float $lon2 Longitude 2
     * @return float Distance in meters
     */
    public static function calculateDistance($lat1, $lon1, $lat2, $lon2) {
        $earthRadius = 6371000; // Earth radius in meters
        
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        $distance = $earthRadius * $c;
        
        return $distance;
    }
}
