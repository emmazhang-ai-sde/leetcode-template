# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:
        res = self.helper(root)
        return targetSum in res


    def helper(self, root):
        if root == None:
            return []

        if root.left == None and root.right == None:
            return [root.val]

        leftRetList = self.helper(root.left)
        rightRetList = self.helper(root.right)

        res = []
        for val in leftRetList:
            res.append(val + root.val)

        for val in rightRetList:
            res.append(val + root.val)

        return res

