import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_reset_code(email: str, code: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not all([smtp_host, smtp_port, smtp_user, smtp_password]):
        print(f"DEBUG: Code for {email} is {code} (SMTP settings missing)")
        return False

    message = MIMEMultipart()
    message["From"] = smtp_user
    message["To"] = email
    message["Subject"] = "Synapsis: Password Reset Code"
    
    body = f"""
    Привет!
    
    Твой код для восстановления пароля в Synapsis: {code}
    
    Если ты не запрашивал сброс пароля, просто проигнорируй это письмо.
    """
    message.attach(MIMEText(body, "plain"))
    
    try:
        with smtplib.SMTP(smtp_host, int(smtp_port)) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(message)
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False
