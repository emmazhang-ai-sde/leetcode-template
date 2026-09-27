from collections import deque

class Solution:
    def isSymmetric(self, root: TreeNode) -> bool:
        return self.dfs(root, root)

    def dfs(self, root1, root2):
        # If both trees are empty, then they are mirror images
        if root1 is None and root2 is None:
            return True

        """ For two trees to be mirror images,
            the following three conditions must be true
            1 - Their root node's key must be same
            2 - left subtree of left tree and right subtree
            of the right tree have to be mirror images
            3 - right subtree of left tree and left subtree
            of right tree have to be mirror images
        """
        if root1 is None or root2 is None:
            return False

        leftRet = self.dfs(root1.left, root2.right)
        rightRet = self.dfs(root1.right, root2.left)

        return root1.val == root2.val and leftRet and rightRet

        # If none of the above conditions is true then root1
        # and root2 are not mirror images
        return False
