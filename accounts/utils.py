from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from project import settings

def send_verification_email(user) :
    uid = urlsafe_base64_encode(force_bytes(user.id))
    token = default_token_generator.make_token(user)
    verification_link = f"http://{settings.DOMAIN}/api/verify-email/{uid}/{token}/"

    send_mail(
        'Verify your email',
        f'Click the link to verify your email: {verification_link}',
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )