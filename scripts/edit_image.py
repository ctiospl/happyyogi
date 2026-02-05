#!/usr/bin/env python3
"""
Image Editor - Edit/transform images using Google's Gemini API with image input.

Requires: GEMINI_API_KEY environment variable

Usage:
    python edit_image.py --input ./photo.jpg --prompt "Place this person in a yoga studio" --output ./result.png
    python edit_image.py --input ./portrait.jpg --prompt "Create a professional headshot version" --output ./headshot.png
"""

import argparse
import base64
import json
import mimetypes
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path


# Gemini 3 Pro Preview for image editing (same as nano-image-generator)
MODEL_ID = "gemini-3-pro-image-preview"

ASPECT_RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"]

API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def get_api_key():
    """Get API key from environment."""
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        print("Error: GEMINI_API_KEY environment variable not set", file=sys.stderr)
        print("Get your API key at: https://aistudio.google.com/apikey", file=sys.stderr)
        sys.exit(1)
    return key


def load_image(image_path: str) -> tuple[bytes, str]:
    """Load image and return bytes + mime type."""
    path = Path(image_path)
    if not path.exists():
        print(f"Error: Image file not found: {image_path}", file=sys.stderr)
        sys.exit(1)

    # Detect mime type
    mime_type, _ = mimetypes.guess_type(str(path))
    if mime_type is None:
        # Try to detect from file content
        with open(path, 'rb') as f:
            header = f.read(12)
        if header[:8] == b'\x89PNG\r\n\x1a\n':
            mime_type = "image/png"
        elif header[:2] == b'\xff\xd8':
            mime_type = "image/jpeg"
        elif header[:4] == b'RIFF' and header[8:12] == b'WEBP':
            mime_type = "image/webp"
        else:
            mime_type = "image/jpeg"  # Default

    image_bytes = path.read_bytes()
    return image_bytes, mime_type


def detect_image_format(image_bytes: bytes) -> tuple[str, str]:
    """Detect actual image format from magic bytes."""
    if image_bytes[:8] == b'\x89PNG\r\n\x1a\n':
        return "image/png", ".png"
    elif image_bytes[:2] == b'\xff\xd8':
        return "image/jpeg", ".jpg"
    elif image_bytes[:4] == b'RIFF' and image_bytes[8:12] == b'WEBP':
        return "image/webp", ".webp"
    elif image_bytes[:6] in (b'GIF87a', b'GIF89a'):
        return "image/gif", ".gif"
    else:
        return "image/png", ".png"


def edit_image(
    source_image_path: str,
    prompt: str,
    aspect_ratio: str = None,
) -> tuple[bytes, str]:
    """
    Edit/transform an image using Gemini API with image input.

    Returns: (image_bytes, mime_type)
    """
    api_key = get_api_key()

    # Load source image
    image_bytes, mime_type = load_image(source_image_path)
    image_b64 = base64.b64encode(image_bytes).decode('utf-8')

    url = f"{API_BASE}/{MODEL_ID}:generateContent?key={api_key}"

    # Build multimodal request with image + text
    parts = [
        {
            "inlineData": {
                "mimeType": mime_type,
                "data": image_b64
            }
        },
        {
            "text": f"Based on this image, generate a new image: {prompt}. Output only the generated image."
        }
    ]

    generation_config = {
        "responseModalities": ["TEXT", "IMAGE"],
    }

    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": generation_config,
    }

    # Make request
    headers = {"Content-Type": "application/json"}
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=300) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"API Error ({e.code}): {error_body}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"Network Error: {e.reason}", file=sys.stderr)
        sys.exit(1)

    # Extract image from response
    candidates = result.get("candidates", [])
    if not candidates:
        print("Error: No candidates in response", file=sys.stderr)
        print(f"Response: {json.dumps(result, indent=2)}", file=sys.stderr)
        sys.exit(1)

    parts = candidates[0].get("content", {}).get("parts", [])

    for part in parts:
        if "inlineData" in part:
            inline_data = part["inlineData"]
            result_bytes = base64.b64decode(inline_data["data"])
            actual_mime, _ = detect_image_format(result_bytes)
            return result_bytes, actual_mime

    # No image found - check for text response
    for part in parts:
        if "text" in part:
            print(f"Model response (no image): {part['text']}", file=sys.stderr)

    print("Error: No image data in response", file=sys.stderr)
    sys.exit(1)


def get_extension(mime_type: str) -> str:
    """Get file extension from MIME type."""
    extensions = {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/webp": ".webp",
        "image/gif": ".gif",
    }
    return extensions.get(mime_type, ".png")


def main():
    parser = argparse.ArgumentParser(
        description="Edit/transform images using Gemini API with image input",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --input ./photo.jpg --prompt "Place in a modern yoga studio" --output ./result.png
  %(prog)s --input ./portrait.jpg --prompt "Create yoga instructor teaching pose" --output ./teaching.png
  %(prog)s --input ./person.webp --prompt "Same person doing tree pose outdoors" --output ./outdoor.png
        """,
    )
    parser.add_argument(
        "--input", "-i",
        required=True,
        help="Source image file path",
    )
    parser.add_argument(
        "--prompt", "-p",
        required=True,
        help="Description of what to generate/transform",
    )
    parser.add_argument(
        "--output", "-o",
        required=True,
        help="Output file path",
    )
    parser.add_argument(
        "--aspect", "-a",
        choices=ASPECT_RATIOS,
        default=None,
        help="Aspect ratio (optional)",
    )

    args = parser.parse_args()

    print(f"Editing image with Gemini...", file=sys.stderr)
    print(f"Source: {args.input}", file=sys.stderr)
    print(f"Prompt: {args.prompt}", file=sys.stderr)

    image_bytes, mime_type = edit_image(
        source_image_path=args.input,
        prompt=args.prompt,
        aspect_ratio=args.aspect,
    )

    # Determine output path
    output_path = Path(args.output)
    correct_ext = get_extension(mime_type)
    output_path = output_path.with_suffix(correct_ext)

    # Create parent directories if needed
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Write image
    output_path.write_bytes(image_bytes)

    print(f"Image saved: {output_path}", file=sys.stderr)
    print(output_path)


if __name__ == "__main__":
    main()
