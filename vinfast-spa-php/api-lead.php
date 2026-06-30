<?php
/**
 * API nhận đăng ký tư vấn (POST)
 */
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/includes/db.php';

$data = json_decode(file_get_contents('php://input'), true);

$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$serviceName = trim($data['serviceName'] ?? '');
$carName = trim($data['carName'] ?? 'Tất cả dòng xe');

// Validate
if (empty($name)) {
    echo json_encode(['success' => false, 'error' => 'Vui lòng nhập họ và tên.']);
    exit;
}

if (!preg_match('/^(0[35789])([0-9]{8})$/', $phone)) {
    echo json_encode(['success' => false, 'error' => 'Số điện thoại không hợp lệ.']);
    exit;
}

try {
    $db = Database::getInstance();
    $db->execute(
        "INSERT INTO leads (name, phone, service_name, car_name) VALUES (?, ?, ?, ?)",
        [$name, $phone, $serviceName, $carName]
    );
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Có lỗi xảy ra. Vui lòng thử lại.']);
}
