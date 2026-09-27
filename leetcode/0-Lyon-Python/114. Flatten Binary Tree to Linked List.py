# Definition for a binary tree node.

# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def dfs(self, root):

        if not root:
            return None

        leftReturn = self.dfs(root.left)
        rightReturn = self.dfs(root.right)

        if leftReturn:
            leftReturn.right = root.right
            root.right = root.left
            root.left = None

        if rightReturn:
            return rightReturn

        if leftReturn:
            return leftReturn

        return root

    def flatten(self, root: Optional[TreeNode]) -> None:
        """
        Do not return anything, modify root in-place instead.
        """
        self.dfs(root)
