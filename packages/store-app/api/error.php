<?php
/**
 * Error Handler
 * Custom error pages for API
 */

$code = $_GET['code'] ?? 500;
$message = '';

switch ($code) {
    case 400:
        $message = 'Bad Request';
        break;
    case 401:
        $message = 'Unauthorized';
        break;
    case 403:
        $message = 'Forbidden';
        break;
    case 404:
        $message = 'Not Found';
        break;
    case 500:
        $message = 'Internal Server Error';
        break;
    default:
        $message = 'Error';
}

http_response_code((int)$code);
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'error' => $message,
    'code' => (int)$code
]);
