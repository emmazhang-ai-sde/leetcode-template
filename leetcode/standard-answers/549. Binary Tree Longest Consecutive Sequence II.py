# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def longestConsecutive(self, root: Optional[TreeNode]) -> int:
        return self.dfs(root)[0]




    def dfs(self, root):
        if not root:
            return 0,0,0

        left_max_len, left_decr, left_incr = self.dfs(root.left)
        right_max_len, right_decr, right_incr = self.dfs(root.right)

        root_desc, root_incr = 0, 0

        if root.left != None and root.left.val + 1 == root.val:
            root_desc = max(root_desc, left_decr + 1)

        if  root.left != None and root.left.val - 1 == root.val:
            root_incr = max(root_incr, left_incr + 1)


        if root.right != None and root.right.val + 1 == root.val:
            root_desc = max(root_desc, right_decr + 1)

        if root.right != None and root.right.val - 1 == root.val:
            root_incr = max(root_incr, right_incr + 1)

        root_max_len = max(root_incr + 1 + root_desc, left_max_len, right_max_len)

        return root_max_len, root_desc, root_incr
