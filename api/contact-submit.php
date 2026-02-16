<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);



// /api/contact-submit.php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function jsonOut(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonOut(405, ['success' => false, 'message' => 'Method not allowed']);
}

// Honeypot
if (!empty($_POST['company'] ?? '')) {
    jsonOut(200, ['success' => true, 'message' => 'OK']); // pretend success
}

// Simple rate limit (per IP)
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/vgee_contact_rate_' . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $ip);
$now = time();
$windowSeconds = 60;     // 1 minute
$maxRequests = 5;

$hits = [];
if (file_exists($rateFile)) {
    $raw = file_get_contents($rateFile);
    $hits = $raw ? json_decode($raw, true) : [];
    if (!is_array($hits)) $hits = [];
}
$hits = array_values(array_filter($hits, fn($t) => is_int($t) && ($now - $t) < $windowSeconds));
if (count($hits) >= $maxRequests) {
    jsonOut(429, ['success' => false, 'message' => 'Too many requests. Please try again shortly.']);
}
$hits[] = $now;
file_put_contents($rateFile, json_encode($hits));

// Read + validate
$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$phone = trim((string)($_POST['phone'] ?? ''));
$topic = trim((string)($_POST['topic'] ?? 'General'));
$message = trim((string)($_POST['message'] ?? ''));

if ($name === '' || $email === '' || $message === '') {
    jsonOut(400, ['success' => false, 'message' => 'Please fill in Full Name, Email and Message.']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonOut(400, ['success' => false, 'message' => 'Please enter a valid email address.']);
}

// Limit sizes (protect server)
if (strlen($name) > 120 || strlen($email) > 180 || strlen($phone) > 60 || strlen($topic) > 60) {
    jsonOut(400, ['success' => false, 'message' => 'One or more fields are too long.']);
}
if (strlen($message) > 5000) {
    jsonOut(400, ['success' => false, 'message' => 'Message is too long (max 5000 chars).']);
}

// Load PHPMailer + Mailer
require_once __DIR__ . '/../vendor/phpmailer/src/Exception.php';
require_once __DIR__ . '/../vendor/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../vendor/phpmailer/src/SMTP.php';
require_once __DIR__ . '/../lib/Mailer.php';

// SMTP config (move to env vars in production)
$config = [
    'host' => 'smtp.your-domain.com',
    'port' => 587,
    'encryption' => 'tls', // or 'ssl'
    'username' => 'pramoegoda@gmail.com',
    'password' => 'uzpj hwsj mpfo zaec',
    'from_email' => 'pramoegoda@gmail.com',
    'from_name' => 'Vertec Global Education and Employment',
    'to_email' => 'pramoegoda@gmail.com',
    'to_name' => 'New Entry Contact Form',
];

$mailer = new Mailer($config);

$result = $mailer->sendContact([
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'topic' => $topic ?: 'General',
    'message' => $message,
    'ip' => $ip,
    'ua' => $_SERVER['HTTP_USER_AGENT'] ?? '',
]);

if (!$result['ok']) {
    // Log server-side (don’t leak internals to user)
    error_log('[VGEE Contact] Mail failed: ' . $result['error']);
    jsonOut(500, ['success' => false, 'message' => 'Could not send right now. Please try again later.']);
}

jsonOut(200, ['success' => true, 'message' => 'Sent']);
