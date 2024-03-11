#!/usr/bin/python3

from PIL import Image
import os

def convert_image(input_path, output_width, output_height):
    img = Image.open(input_path)
    img_resized = img.resize((output_width, output_height), Image.ANTIALIAS)
    img_gray = img_resized.convert('L')
    img_1bpp = img_gray.point(lambda x: 0 if x < 128 else 255, '1')
    return img_1bpp

def convert_and_append_header(input_directory, size):
    input_files = [f for f in os.listdir(input_directory) if f.startswith("image_") and f.endswith(".png")]
    input_files.sort()
    header_bytes = size.to_bytes(1, byteorder='big') + size.to_bytes(1, byteorder='big') + b'\x01'

    for i, input_file in enumerate(input_files):
        input_path = os.path.join(input_directory, input_file)
        img_1bpp = convert_image(input_path, size, size)
        output_file = input_path + ".raw"

        with open(output_file, 'wb') as raw_file:
            raw_file.write(header_bytes)
            raw_file.write(img_1bpp.tobytes())

if __name__ == "__main__":
    input_directory = "."  # Replace with the path to your image directory
    output_width = 88
    output_file_path = "output_with_header.raw"  # Replace with the desired output file path

    convert_and_append_header(input_directory, output_width)
