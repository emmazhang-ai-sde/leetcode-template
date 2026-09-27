"""
# Definition for a Node.
class Node:
    def __init__(self, val = 0, neighbors = None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []
"""

from typing import Optional
class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        if node is None:
            return None

        queue = collections.deque([node])
        maps = {}
        while len(queue) > 0:
            curr = queue.popleft()
            maps[curr] = Node(curr.val)
            for nei in curr.neighbors:
                if nei not in maps:
                    queue.append(nei)

        for old_node, new_node in maps.items():
            for old_nei in old_node.neighbors:
                newNei = maps[old_nei]
                new_node.neighbors.append(newNei)
        return maps[node]