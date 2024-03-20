DESCRIPTION = """
Plot a heatmap of good step tunings for 39-key Exquis layouts.

Layouts are scored by the sum of the inverse Tenney height of intervals
within an integer limit approximated within an error limit, taking the
center pad as 1/1. Point values for each interval are scaled based on
the square of the absolute error of the best approximation, down to 0
at the error limit.

Computation will take a few minutes.
"""

from argparse import ArgumentParser
import shelve
from fractions import Fraction
from itertools import chain
from math import log, log2
from multiprocessing import Pool
from typing import Iterable

parser = ArgumentParser(description=DESCRIPTION)
parser.add_argument('--error-limit', type=float, default=15)
parser.add_argument('--integer-limit', type=int, default=16)
parser.add_argument('--cached', action='store_true')
args = parser.parse_args()

import plotly.express as px
from tqdm import tqdm

def integer_limit_intervals(limit: int) -> set[Fraction]:
    return set(Fraction(n, d)
               for n in range(1, limit+1)
               for d in range(1, limit+1))

def cents(r: Fraction) -> float:
    return 1200 * log(r) / log(2)

def tenney_height(r: Fraction) -> float:
    return log2(r.numerator * r.denominator)

step_range = list(range(args.error_limit, 702 + args.error_limit))
error_limit_squared = args.error_limit ** 2

# Discard 1/1 since its inverse Tenney height is undefined.
rs = [r for r in integer_limit_intervals(args.integer_limit)
      if r != Fraction(1)]

interval_cents = {r: cents(r) for r in rs}

def point_value(interval: Fraction, cents: float, best_approximation: float) -> float:
    error = abs(best_approximation - cents)
    return 1 / tenney_height(interval) * max(0, 1 - error*error / error_limit_squared)

def row(g1: int, g2: int) -> Iterable[tuple[int, int]]:
    length = 3 if (g1 + g2) % 2 == 0 else 4
    return ((g1 - i, g2 + i) for i in range(length))

vectors = list(chain(
    row(4, 1), row(3, 1), row(3, 0), row(2, 0), row(2, -1),
    row(1, -1),
    row(1, -2), row(0, -2), row(0, -3), row(-1, -3), row(-1, -4)
))

cache = {}
cache_path = 'scripts/layout_heatmap'

def closest(x: float, xs: list[float]) -> float:
    return min(xs, key=lambda y: abs(x - y))

def layout_score(steps: tuple[float, float]) -> float:
    key = tuple(sorted(steps))
    if key not in cache:
        cents_values = [steps[0]*v[0] + steps[1]*v[1] for v in vectors]
        cache[key] = sum(point_value(r, c, closest(c, cents_values))
                         for r, c in interval_cents.items())
    return cache[key]

def write_figure(matrix: list[list[float]]):
    # Round the scores to reduce file sizes.
    matrix = [[round(x, 1) for x in row] for row in matrix]
    fig = px.imshow(matrix,
                    title='LCJI approximation by Exquis 39-key note layouts',
                    labels={'x': 'Up-right step', 'y': 'Up-left step', 'color': 'Score'},
                    x=step_range,
                    y=step_range)
    fig.write_html('src/layout-heatmaps/exquis39.html', include_plotlyjs='cdn')
    with shelve.open(cache_path) as db:
        db['exquis39'] = matrix

def main():
    if args.cached:
        with shelve.open(cache_path) as db:
            matrix = db['exquis39']
    else:
        with Pool(4) as p:
            matrix = [p.map(layout_score, [(upleft, upright)
                                           for upright in step_range])
                      for upleft in tqdm(step_range)]

    write_figure(matrix)

if __name__ == '__main__':
    main()