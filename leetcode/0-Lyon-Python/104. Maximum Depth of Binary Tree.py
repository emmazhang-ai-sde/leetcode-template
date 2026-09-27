# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def dfs(self, root, height):
        if not root:
            return

        self.maxHeight = max(self.maxHeight, height)
        self.dfs(root.left, height + 1)
        self.dfs(root.right, height + 1)

    def maxDepth(self, root: Optional[TreeNode]) -> int:
        # Solution1: traverse
        # self.maxHeight = 0
        # self.dfs(root, 1)
        # return self.maxHeight

        # Solution2: Divide and Conquer

        height = self.dfs(root)
        return height



    def dfs(self, root):

        if not root:
            return 0

        leftReturn = self.dfs(root.left)
        rightReturn = self.dfs(root.right)

        # Optional Leaf processing
        if root.left is None and root.right is None:
            return 1

        height  = max(leftReturn, rightReturn) + 1

        return height
