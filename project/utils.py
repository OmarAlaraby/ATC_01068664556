from rest_framework.exceptions import ValidationError

def get_attr_or_400(request, key):
    value = request.data.get(key)
    if not value:
        raise ValidationError({key: [f"{key} is required in the request body"]})
    return value
