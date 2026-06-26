import filetype

from pathlib import Path



from django.conf import settings

from rest_framework import serializers



EXTENSION_MIME_MAP = {

    ".png": {"image/png"},

    ".jpg": {"image/jpeg"},

    ".jpeg": {"image/jpeg"},

    ".pdf": {"application/pdf"},

}





def _validate_text_content(file_obj) -> str:

    sample = file_obj.read(8192)

    file_obj.seek(0)



    if b"\x00" in sample:

        raise serializers.ValidationError("File content does not match allowed types.")



    try:

        sample.decode("utf-8")

    except UnicodeDecodeError as exc:

        raise serializers.ValidationError("File content does not match allowed types.") from exc



    return "text/plain"





def detect_file_mime(file_obj) -> str:

    extension = Path(file_obj.name).suffix.lower()



    if extension == ".txt":

        return _validate_text_content(file_obj)



    head = file_obj.read(261)

    file_obj.seek(0)



    kind = filetype.guess(head)

    if not kind:

        raise serializers.ValidationError("File content does not match allowed types.")



    allowed_for_extension = EXTENSION_MIME_MAP.get(extension)

    if allowed_for_extension and kind.mime not in allowed_for_extension:

        raise serializers.ValidationError("File content does not match allowed types.")



    if kind.mime not in settings.ALLOWED_MIME_TYPES:

        raise serializers.ValidationError("File content does not match allowed types.")



    return kind.mime





def validate_upload_file(file_obj) -> str:
    if file_obj.size > settings.MAX_UPLOAD_SIZE_BYTES:
        raise serializers.ValidationError(
            f"File size exceeds the maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB} MB."
        )

    extension = Path(file_obj.name).suffix.lower()
    if extension not in settings.ALLOWED_FILE_EXTENSIONS:
        raise serializers.ValidationError(
            "File type not allowed. Allowed types: PNG, JPG, PDF, TXT."
        )

    return detect_file_mime(file_obj)


