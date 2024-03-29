DESCRIPTION = """
Retune notes in a Faunatone module to the closest match in a given EDO.
"""

# Faunatone save files are zlib-compressed JSON.
import json, zlib

def read_faun(path: str) -> dict:
    with open(path, 'rb') as f:
        compressed_data = f.read()
    data = zlib.decompress(compressed_data)
    return json.loads(data)

def write_faun(song: dict, path: str):
    data = bytes(json.dumps(song), 'utf8')
    compressed_data = zlib.compress(data)
    with open(path, 'wb') as f:
        f.write(compressed_data)

def retune(note: float, edo: int) -> float:
    step_size = 12 / edo
    return round(note / step_size) * step_size

def main(path: str, edo: int):
    song = read_faun(path)
    for track in song['Tracks']:
        for event in track['Events']:
            if event['Type'] == 1:
                event['FloatData'] = retune(event['FloatData'], edo)
    write_faun(song, path)

if __name__ == '__main__':
    from argparse import ArgumentParser
    parser = ArgumentParser(description=DESCRIPTION)
    parser.add_argument('faun', type=str)
    parser.add_argument('edo', type=int)
    args = parser.parse_args()
    main(args.faun, args.edo)