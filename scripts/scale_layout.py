DESCRIPTION = """
Plot a heatmap of good step tunings for isomorphic note layouts.

Layouts are scored by the sum of the inverse Tenney height of intervals
within an integer limit approximated within an error limit, taking the
center pad as 1/1. Point values for each interval are scaled based on
the square of the absolute error of the best approximation, down to 0
at the error limit.

Computation takes a few minutes, especially for larger controllers.
"""

from fractions import Fraction
from itertools import chain
from math import log
from pprint import pprint
from statistics import mean
from typing import Callable, Iterable, NamedTuple

from tqdm import tqdm

def cents(r: Fraction) -> float:
    return 1200 * log(r) / log(2)

class Pad(NamedTuple):
    vector: tuple[int, int]
    cents: float

def closest(x: float, pads: list[Pad]) -> Pad:
    return min(pads, key=lambda p: abs(x - p.cents))

def exquis_vectors_from_rowfunc(row: Callable) -> list[tuple[int, int]]:
    return list(chain(row(4, 1), row(3, 1), row(3, 0), row(2, 0), row(2, -1),
                      row(1, -1), row(1, -2), row(0, -2), row(0, -3),
                      row(-1, -3), row(-1, -4)))

def exquis_vectors() -> list[tuple[int, int]]:
    def row(g1: int, g2: int) -> Iterable[tuple[int, int]]:
        length = 5 if (g1 + g2) % 2 == 0 else 6
        return ((g1 + 1 - i, g2 - 1 + i) for i in range(length))
    return exquis_vectors_from_rowfunc(row)

vectors = exquis_vectors()

class Result(NamedTuple):
    steps: tuple[float, float]
    error: float
    size: float
    step_size: float

def vector_distance(v1: tuple[int, int], v2: tuple[int, int]) -> tuple[int, int]:
    return v2[0] - v1[0], v2[1] - v1[0]

def layout_result(targets: list[float], steps: tuple[float, float]) -> Result:
    pads = [Pad(v, steps[0]*v[0] + steps[1]*v[1]) for v in vectors]
    matches = [closest(t, pads) for t in targets]
    error = max(abs(t - p.cents) for (t, p) in zip(targets, matches))
    size = max(sum(map(abs, p.vector)) for p in matches)
    step_size = max(sum(map(abs, vector_distance(matches[i].vector, matches[i+1].vector)))
                    for i in range(len(matches) - 1))
    return Result(steps, error, size, step_size)

def compute(targets: list[float]) -> list[Result]:
    results = list(tqdm(layout_result(targets, (x, y))
                        for x in range(20, 720)
                        for y in range(x, 720)))
    results.sort(key=lambda x: x.error/2 + x.size + x.step_size)
    return results

def main():
    from argparse import ArgumentParser
    parser = ArgumentParser(description=DESCRIPTION)
    parser.add_argument('ratio', nargs='+')
    args = parser.parse_args()
    results = compute([cents(Fraction(s)) for s in args.ratio])
    pprint(results[:10])

if __name__ == '__main__':
    main()