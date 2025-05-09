from rest_framework.views import exception_handler
from rest_framework.response import Response


def ExceptionResponse(message, errors):
    response = exception_handler(message, errors)

    if response is not None:
        custom_response = {
            'status': response.status_code,
            'message': 'Validation failed' if response.status_code == 400 else 'Error',
            'errors': response.data
        }
        return Response(custom_response, status=response.status_code)

    return response
