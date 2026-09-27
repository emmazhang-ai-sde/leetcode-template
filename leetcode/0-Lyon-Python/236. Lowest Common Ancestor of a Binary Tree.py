# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, x):
#         self.val = x
#         self.left = None
#         self.right = None

class Solution:

    def dfs(self, root, p, q):

        if not root:
            return 0, None

        leftCount, leftNode = self.dfs(root.left, p, q)
        rightCount, rightNode = self.dfs(root.right, p, q)

        # found 2 result
        if leftCount == 2:
            return (leftCount, leftNode)

        if rightCount == 2:
            return (rightCount, rightNode)

        selfCount = 0
        if root == p or root == q:
            selfCount = 1

        totalCount = selfCount + leftCount + rightCount

        if totalCount == 2:
            return (totalCount, root)

        # found 1 result
        if totalCount == 1:
            return  (totalCount, root)


        # found 0 result
        return (0, None)

    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        count, res = self.dfs(root, p, q)
        if count!=2:
            return None
        return res
