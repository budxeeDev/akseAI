<?php
// Mengambil variabel lingkungan MYSQL_URL
$mysql_url = getenv('MYSQL_URL');
if (!$mysql_url) {
    die('MYSQL_URL is not set in environment variables.');
}

// Parsing URL
$url = parse_url($mysql_url);
$host = $url['host'];
$port = $url['port'];
$user = $url['user'];
$password = $url['pass'];
$dbname = ltrim($url['path'], '/');

// Membuat koneksi ke database
$conn = new mysqli($host, $user, $password, $dbname, $port);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

$user_id = 1;
$message = "Halo, apa kabar?";
$response = "Halo! Saya baik-baik saja, terima kasih!";

$sql = "INSERT INTO conversation (user_id, message, response) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iss", $user_id, $message, $response);

// Mengeksekusi query
if ($stmt->execute()) {
    echo "Percakapan berhasil disimpan!";
} else {
    echo "Error: " . $stmt->error;
}

// Menutup koneksi
$stmt->close();
$conn->close();
?>
