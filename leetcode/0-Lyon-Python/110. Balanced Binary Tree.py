# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def DFS(self, root):
        if root is None:
            return (0, True)

        leftReturn, isleftBal = self.DFS(root.left)
        rightReturn, isRightBal = self.DFS(root.right)

        if abs(leftReturn - rightReturn) >1 or not isleftBal or not isRightBal:
            return (0, False)

        return (max(rightReturn, leftReturn) + 1, True)

    def isBalanced(self, root: Optional[TreeNode]) -> bool:

        height,isBal = self.DFS(root)
        return isBal