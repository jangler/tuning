DESCRIPTION = """
Print an Exquis-specific table from cached layout_heatmap.py data.

The table is scored by the total score of each layout across both
Exquis variants.
"""

from argparse import ArgumentParser
import shelve

parser = ArgumentParser(description=DESCRIPTION)
parser.add_argument('--min-step', type=int, default=15)
parser.add_argument('--cache-path', default='scripts/layout_heatmap')
args = parser.parse_args()

from tabulate import tabulate

if __name__ == '__main__':
    with shelve.open(args.cache_path) as db:
        matrices = db['exquis39'], db['exquis']

    headers = 'Up-left step', 'Up-right step', '39-score', '61-score', 'Total score'
    data = [(y + args.min_step, x + args.min_step,
             matrices[0][y][x], matrices[1][y][x],
             matrices[0][y][x] + matrices[1][y][x])
            for y in range(len(matrices[0]))
            for x in range(len(matrices[0][y]))
            if x > y]
    data.sort(key=lambda x: x[-1], reverse=True)
    
    print(tabulate(data, headers=headers))