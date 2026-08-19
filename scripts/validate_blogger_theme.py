from pathlib import Path
from xml.etree import ElementTree
import sys


def main() -> int:
    path = Path(sys.argv[1])
    try:
        ElementTree.parse(path)
    except ElementTree.ParseError as error:
        print(f"Invalid XML: {error}")
        return 1

    print(f"Valid XML: {path.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
