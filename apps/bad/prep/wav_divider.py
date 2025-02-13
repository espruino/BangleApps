#!/usr/bin/python3

def divide_bytes(input_file, output_file):
    with open(input_file, 'rb') as infile:
        with open(output_file, 'wb') as outfile:
            byte = infile.read(1)
            while byte:
                # Convert byte to integer, divide by 4, and write back as byte
                new_byte = bytes([int.from_bytes(byte, byteorder='big') // 3])
                outfile.write(new_byte)
                byte = infile.read(1)

divide_bytes("output.wav", "output.raw")
