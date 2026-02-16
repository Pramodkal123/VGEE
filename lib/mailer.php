<?php
// /lib/Mailer.php

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

final class Mailer
{
    private array $cfg;

    public function __construct(array $config)
    {
        $this->cfg = $config;
    }

    public function sendContact(array $payload): array
    {
        $mail = new PHPMailer(true);

        try {
            // SMTP (recommended)
            $mail->isSMTP();
            $mail->Host       = $this->cfg['host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $this->cfg['username'];
            $mail->Password   = $this->cfg['password'];
            $mail->SMTPSecure = $this->cfg['encryption']; // 'tls' or 'ssl'
            $mail->Port       = (int)$this->cfg['port'];

            $mail->CharSet = 'UTF-8';

            // From + To
            $mail->setFrom($this->cfg['from_email'], $this->cfg['from_name']);
            $mail->addAddress($this->cfg['to_email'], $this->cfg['to_name']);

            // Reply-to should be the user (safe when validated)
            $mail->addReplyTo($payload['email'], $payload['name']);

            $subject = "VGEE Contact Form: " . $payload['topic'];
            $mail->Subject = $subject;

            // Build a verbose email body
            $lines = [];
            $lines[] = "New contact form submission:";
            $lines[] = "----------------------------------------";
            $lines[] = "Name: " . $payload['name'];
            $lines[] = "Email: " . $payload['email'];
            $lines[] = "Phone/WhatsApp: " . ($payload['phone'] ?: '-');
            $lines[] = "Topic: " . $payload['topic'];
            $lines[] = "Time (UTC): " . gmdate('Y-m-d H:i:s');
            $lines[] = "IP: " . ($payload['ip'] ?: '-');
            $lines[] = "User Agent: " . ($payload['ua'] ?: '-');
            $lines[] = "----------------------------------------";
            $lines[] = "Message:";
            $lines[] = $payload['message'];

            $bodyText = implode("\n", $lines);
            $mail->Body = $bodyText;
            $mail->AltBody = $bodyText;

            $mail->send();

            return ['ok' => true, 'error' => null];
        } catch (Exception $e) {
            return ['ok' => false, 'error' => $mail->ErrorInfo ?: $e->getMessage()];
        }
    }
}
