# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right



class Solution:
    def dfs(self, root, result):
        if not root:
            return
        result.append(root.val)
        self.dfs(root.left, result)
        self.dfs(root.right, result)

    def preorderTraversal(self, root: Optional[TreeNode]) -> List[int]:

        # result = []
        # self.dfs(root, result)
        # return result
        stack = []
        result = []
        if root:
            stack.append(TypeNode(1,root))

        while stack:
            curr = stack.pop(-1)
            if curr.node == None:
                continue
            if curr.type == 0:
                result.append(curr.node.val)
            else:
                stack.append(TypeNode(1,curr.node.right))
                stack.append(TypeNode(1,curr.node.left))
                stack.append(TypeNode(0,curr.node))

        return result

class TypeNode:
    def __init__(self,type,node):
        self.type = type  # 0 == output, 1 visit
        self.node = node