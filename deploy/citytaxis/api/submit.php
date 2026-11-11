<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);
if (!$data) {
    $data = $_POST;
}

if (empty($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No data provided']);
    exit;
}

// 1. Log submission permanently to server
$logFile = __DIR__ . '/submissions.log';
$logEntry = [
    'timestamp' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    'data' => $data
];
@file_put_contents($logFile, json_encode($logEntry, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n---\n", FILE_APPEND);

// 2. Identify Brand
$host = $_SERVER['HTTP_HOST'] ?? '';
$isTaxiDrive = (strpos($host, 'taxidrive') !== false || (isset($data['brand']) && strpos(strtolower($data['brand']), 'drive') !== false) || (isset($data['_subject']) && strpos(strtolower($data['_subject']), 'drive') !== false));

$brandName = $isTaxiDrive ? 'Taxi Drive' : 'City Taxis';
$badge = $isTaxiDrive ? 'TD' : 'CT';
$themeColor = $isTaxiDrive ? '#d4af37' : '#e8c88a';
$bgDark = '#08080a';

// 3. Unified Gmail Account for all requests (City Taxis & Taxi Drive)
$smtpUser = 'swisstaxibooking@gmail.com';
$smtpPass = 'ciwydhccansupwox';
$toEmail = 'swisstaxibooking@gmail.com';
$ccEmail = '';

$type = $data['Type de demande'] ?? 'Réservation';
$nom = $data['Nom'] ?? 'Client';
$clientEmail = $data['Email'] ?? $data['email'] ?? '';
$phone = $data['Telephone'] ?? $data['Téléphone'] ?? '';
$cleanPhone = preg_replace('/[^0-9+]/', '', $phone);
$waPhone = preg_replace('/[^0-9]/', '', $phone);

$subject = ($type === 'Devis' ? 'Demande de devis' : 'Nouvelle réservation') . ' - ' . $nom . ' (' . date('d/m H:i') . ') - ' . $brandName;

// Build Ultra-Compact HTML Table
$rowsHtml = '';
$order = [
    'Type de demande', 'Nom', 'Telephone', 'Téléphone', 'Email',
    'Adresse départ', 'Adresse depart', 'Depart', 'Départ',
    'Ville',
    'Destination ville', 'Destination',
    'Date', 'Heure',
    'Passagers', 'Vehicule', 'Véhicule', 'Trajet', 'Type de course',
    'Type de trajet', 'Vol', 'Message', 'Notes'
];

$seen = [];
foreach ($order as $k) {
    if (isset($data[$k]) && !in_array($k, $seen)) {
        $seen[] = $k;
        $v = $data[$k];
        if ($v === '' || strpos($k, '_') === 0) continue;
        if (is_array($v)) $v = implode(', ', $v);
        $isHl = in_array($k, ['Adresse départ', 'Adresse depart', 'Depart', 'Départ', 'Ville', 'Destination ville', 'Destination', 'Date', 'Heure', 'Telephone', 'Téléphone']);
        $valCol = $isHl ? '#0f172a' : '#1e293b';
        $valBg = $isHl ? '#f8fafc' : '#ffffff';
        $rowsHtml .= '<tr style="background:' . $valBg . ';">';
        $rowsHtml .= '<td style="padding:4px 6px;border-bottom:1px solid #eef2f6;color:#64748b;font-weight:bold;width:33%;font-size:11px;">' . htmlspecialchars($k) . '</td>';
        $rowsHtml .= '<td style="padding:4px 6px;border-bottom:1px solid #eef2f6;color:' . $valCol . ';font-weight:' . ($isHl ? '700' : '500') . ';font-size:11px;">' . nl2br(htmlspecialchars($v)) . '</td>';
        $rowsHtml .= '</tr>';
    }
}

foreach ($data as $k => $v) {
    if (!in_array($k, $seen) && strpos($k, '_') !== 0 && $v !== '') {
        if (is_array($v)) $v = implode(', ', $v);
        $rowsHtml .= '<tr style="background:#ffffff;">';
        $rowsHtml .= '<td style="padding:4px 6px;border-bottom:1px solid #eef2f6;color:#64748b;font-weight:bold;width:33%;font-size:11px;">' . htmlspecialchars($k) . '</td>';
        $rowsHtml .= '<td style="padding:4px 6px;border-bottom:1px solid #eef2f6;color:#0f172a;font-weight:500;font-size:11px;">' . nl2br(htmlspecialchars($v)) . '</td>';
        $rowsHtml .= '</tr>';
    }
}

$quickActions = '';
if (!empty($cleanPhone)) {
    $quickActions = '<tr><td style="background:#f8fafc;padding:5px 8px;border-bottom:1px solid #e2e8f0;">';
    $quickActions .= '<table width="100%" cellpadding="0" cellspacing="0"><tr>';
    $quickActions .= '<td style="font-size:11px;color:#334155;font-weight:bold;">' . htmlspecialchars($nom) . '</td>';
    $quickActions .= '<td align="right">';
    $quickActions .= '<a href="tel:' . htmlspecialchars($cleanPhone) . '" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:10px;font-weight:bold;text-decoration:none;padding:3px 7px;border-radius:4px;margin-right:4px;">📞 Appeler</a>';
    $quickActions .= '<a href="https://wa.me/' . htmlspecialchars($waPhone) . '" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:10px;font-weight:bold;text-decoration:none;padding:3px 7px;border-radius:4px;">💬 WhatsApp</a>';
    $quickActions .= '</td></tr></table></td></tr>';
}

$html = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' . htmlspecialchars($brandName) . '</title></head>';
$html .= '<body style="margin:0;padding:4px;background:#eef1f5;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Arial,sans-serif;-webkit-text-size-adjust:none;">';
$html .= '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;overflow:hidden;">';
$html .= '<tr><td style="background:' . $bgDark . ';padding:6px 10px;border-bottom:2px solid ' . $themeColor . ';">';
$html .= '<table width="100%" cellpadding="0" cellspacing="0"><tr>';
$html .= '<td><span style="display:inline-block;background:' . $themeColor . ';color:#000;font-size:9px;font-weight:900;padding:2px 4px;border-radius:3px;margin-right:4px;vertical-align:middle;">' . $badge . '</span>';
$html .= '<strong style="color:#ffffff;font-size:12px;vertical-align:middle;letter-spacing:0.5px;">' . strtoupper(htmlspecialchars($brandName)) . '</strong></td>';
$html .= '<td align="right"><span style="display:inline-block;background:rgba(212,175,55,0.2);color:' . $themeColor . ';font-size:10px;font-weight:bold;padding:2px 5px;border-radius:3px;">' . htmlspecialchars($type) . '</span></td>';
$html .= '</tr></table></td></tr>';
$html .= $quickActions;
$html .= '<tr><td style="padding:2px 6px;"><table width="100%" cellpadding="0" cellspacing="0" style="line-height:1.3;">' . $rowsHtml . '</table></td></tr>';
$html .= '<tr><td style="background:#f8fafc;padding:3px 8px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;text-align:center;">' . htmlspecialchars($brandName) . ' • ' . date('d/m/Y H:i') . '</td></tr>';
$html .= '</table></body></html>';

// 4. Send via Gmail SSL SMTP directly (port 465)
function sendGmailSSL($smtpUser, $smtpPass, $toEmail, $subject, $htmlBody, $fromName, $replyTo, $ccEmail) {
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);

    $socket = @stream_socket_client('ssl://smtp.gmail.com:465', $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        return ['success' => false, 'error' => "Connection failed: $errstr ($errno)"];
    }

    $read = function() use ($socket) {
        $data = '';
        while ($str = fgets($socket, 515)) {
            $data .= $str;
            if (substr($str, 3, 1) === ' ') break;
        }
        return $data;
    };
    $write = function($cmd) use ($socket) {
        fputs($socket, $cmd . "\r\n");
    };

    $read();
    $write('EHLO ' . gethostname()); $read();
    $write('AUTH LOGIN'); $read();
    $write(base64_encode($smtpUser)); $read();
    $write(base64_encode(str_replace(' ', '', $smtpPass)));
    $authResp = $read();

    if (strpos($authResp, '235') === false) {
        fclose($socket);
        return ['success' => false, 'error' => "Auth failed: " . trim($authResp)];
    }

    $write('MAIL FROM: <' . $smtpUser . '>'); $read();
    $write('RCPT TO: <' . $toEmail . '>'); $read();
    if (!empty($ccEmail)) { $write('RCPT TO: <' . $ccEmail . '>'); $read(); }

    $write('DATA'); $read();

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <" . $smtpUser . ">\r\n";
    $headers .= "To: <" . $toEmail . ">\r\n";
    if (!empty($replyTo)) $headers .= "Reply-To: <" . $replyTo . ">\r\n";
    if (!empty($ccEmail)) $headers .= "Cc: <" . $ccEmail . ">\r\n";
    $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
    $headers .= "Date: " . date('r') . "\r\n";

    $write($headers . "\r\n" . $htmlBody . "\r\n.");
    $dataResp = $read();

    $write('QUIT'); $read();
    fclose($socket);

    return ['success' => (strpos($dataResp, '250') !== false), 'response' => trim($dataResp)];
}

$smtpResult = sendGmailSSL($smtpUser, $smtpPass, $toEmail, $subject, $html, $brandName, $clientEmail, $ccEmail);

echo json_encode([
    'success' => true,
    'smtp' => $smtpResult,
    'mailSent' => $smtpResult['success'],
    'message' => 'Demande reçue et traitée avec succès.'
]);
