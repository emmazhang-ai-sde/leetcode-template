# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        res = []
        self.bfs(root, res)
        return res;


    def bfs(self, node, res):
        import collections
        queue = collections.deque()
        queue.append(node)

        while len(queue) > 0:
            size = len(queue)
            levelRes = []
            for _ in range(size):
                curr = queue.popleft()
                if curr:
                    levelRes.append(curr.val)
                    queue.append(curr.left)
                    queue.append(curr.right)
            if levelRes:
                res.append(levelRes)
