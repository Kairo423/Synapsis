import smtplib
import os
from email.header import Header
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr


def is_smtp_configured() -> bool:
    return all([
        os.getenv("SMTP_HOST"),
        os.getenv("SMTP_USER"),
        os.getenv("SMTP_PASSWORD"),
    ])


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def send_reset_code(email: str, code: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT", "587")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM") or smtp_user
    smtp_from_name = os.getenv("SMTP_FROM_NAME", "Synapsis")
    smtp_timeout = int(os.getenv("SMTP_TIMEOUT", "10"))
    use_ssl = _env_bool("SMTP_USE_SSL", smtp_port == "465")
    use_tls = _env_bool("SMTP_USE_TLS", not use_ssl)
    
    if not is_smtp_configured():
        print(f"DEBUG: Code for {email} is {code} (SMTP settings missing)")
        return True

    message = MIMEMultipart()
    message["From"] = formataddr((str(Header(smtp_from_name, "utf-8")), smtp_from))
    message["To"] = email
    message["Subject"] = "Synapsis: Password Reset Code"
    
    body = f"""
    Привет!
    
    Твой код для восстановления пароля в Synapsis: {code}
    
    Если ты не запрашивал сброс пароля, просто проигнорируй это письмо.
    """
    message.attach(MIMEText(body, "plain", "utf-8"))
    
    try:
        smtp_cls = smtplib.SMTP_SSL if use_ssl else smtplib.SMTP
        with smtp_cls(smtp_host, int(smtp_port), timeout=smtp_timeout) as server:
            if use_tls:
                server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False
