<?php
// Define o e-mail de destino
$destinatario = "suporte.literary@gmail.com";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Coleta os dados do formulário usando os atributos 'name' definidos no HTML
    $nome = htmlspecialchars(trim($_POST['contactName']));
    $email = htmlspecialchars(trim($_POST['contactEmail']));
    $assunto = htmlspecialchars(trim($_POST['contactSubject']));
    $mensagem = htmlspecialchars(trim($_POST['contactMessage']));

    if (empty($nome) || empty($email) || empty($assunto) || empty($mensagem)) {
        http_response_code(400); // Bad Request
        echo "Por favor, preencha todos os campos do formulário.";
        exit;
    }

    $corpo_email = "Detalhes da Mensagem:\n\n";
    $corpo_email .= "Nome: " . $nome . "\n";
    $corpo_email .= "E-mail: " . $email . "\n";
    $corpo_email .= "Assunto: " . $assunto . "\n\n";
    $corpo_email .= "Mensagem:\n" . $mensagem . "\n";

    $headers = 'From: ' . $nome . ' <' . $email . '>' . "\r\n" .
               'Reply-To: ' . $email . "\r\n" .
               'X-Mailer: PHP/' . phpversion();

    if (mail($destinatario, $assunto, $corpo_email, $headers)) {
        http_response_code(200);
        echo "Mensagem enviada com sucesso!";
    } else {
        http_response_code(500); // Internal Server Error
        echo "Ocorreu um erro ao tentar enviar sua mensagem. Verifique a configuração do servidor.";
    }

} else {
    http_response_code(403);
    echo "Acesso proibido.";
}
?>