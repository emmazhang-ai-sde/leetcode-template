# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, x):
#         self.val = x
#         self.left = None
#         self.right = None

class Solution:
    def distanceK(self, root: TreeNode, target: TreeNode, k: int) -> List[int]:
        graph = collections.defaultdict(list)
        self.dfs(root, graph, None)

        queue = collections.deque([target])
        visited = set()
        visited.add(target)

        while len(queue) > 0 and k >=0:
            size = len(queue)
            res = []
            for _ in range(size):
                curr = queue.popleft()
                res.append(curr.val)
                for neighbour in graph[curr]:
                    if neighbour not in visited:
                        visited.add(curr)
                        queue.append(neighbour)
            k-=1

        if k == -1:
            return res
        else:
            return []

    def dfs(self, node, graph, parent):
        if parent:
            graph[node].append(parent)
        if node.left:
            graph[node].append(node.left)
            self.dfs(node.left, graph, node)
        if node.right:
            graph[node].append(node.right)
            self.dfs(node.right, graph, node)






