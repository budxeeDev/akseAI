<?php
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

// Hubungkan ke database
$conn = new mysqli($host, $user, $password, $dbname, $port);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
