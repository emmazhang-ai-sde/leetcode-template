# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def dfs(self, root):

        if not root:
            return (True, float("INF"), float("-INF"))

        leftValid, leftMin, leftMax = self.dfs(root.left)
        rightValid, rightMin, rightMax = self.dfs(root.right)

        if not leftValid or not rightValid:
            return (False, 0, 0)

        if (root.left and leftMax >= root.val) or (root.right and rightMin <= root.val):
            return (False, 0, 0)

        return (True, min(root.val, leftMin), max(root.val, rightMax))

    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        isValid, minVal, maxVal = self.dfs(root)
        return isValid
