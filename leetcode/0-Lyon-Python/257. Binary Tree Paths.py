# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def dfs(self, root) -> List[str]:
        returnPath = []
        if not root:
            return returnPath

        leftReturn = self.dfs(root.left)
        rightReturn = self.dfs(root.right)

        # Optional Leaf processing
        if root.left is None and root.right is None:
            return [str(root.val)]

        for list_str in leftReturn:
            returnPath.append(str(root.val)+ "->" + list_str)

        for list_str in rightReturn:
            returnPath.append(str(root.val)+ "->" + list_str)

        return returnPath

    def binaryTreePaths(self, root: Optional[TreeNode]) -> List[str]:
        res =  self.dfs(root)
        return res
