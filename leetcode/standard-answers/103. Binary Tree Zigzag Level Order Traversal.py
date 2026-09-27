# Definition for a binary tree node.
# class TreeNode(object):
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution(object):
    def zigzagLevelOrder(self, root):
        """
        :type root: TreeNode
        :rtype: List[List[int]]
        """
        res = []
        self.bfs(root, res)
        return res

    def bfs(self, node, res):
        import collections
        queue = collections.deque()
        queue.append(node)
        level = 0
        while len(queue) > 0:
            size = len(queue)
            temp = []
            for _ in range(size):
                curr = queue.popleft()
                if curr:
                    if level % 2== 1:
                        temp.insert(0, curr.val)
                    else:
                        temp.append(curr.val)
                    queue.append(curr.left)
                    queue.append(curr.right)
            level+=1
            if temp:
                res.append(temp)
