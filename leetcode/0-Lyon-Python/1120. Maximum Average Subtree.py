# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def dfs(self, root):

        if not root:
            return (0, 0)

        leftCount, leftSum = self.dfs(root.left)
        rightCount, rightSum = self.dfs(root.right)

        currentAvg = (leftSum + rightSum + root.val) / (leftCount + rightCount + 1)

        self.maxAvg = max(currentAvg, self.maxAvg)

        return (leftCount+rightCount+1, leftSum + rightSum + root.val)


    def maximumAverageSubtree(self, root: Optional[TreeNode]) -> float:
        self.maxAvg = 0
        self.dfs(root)
        return self.maxAvg
        