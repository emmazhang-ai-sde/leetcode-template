class Solution:
    def dfs(self, root, result):
        if not root:
            return

        self.dfs(root.left, result)
        result.append(root.val)
        self.dfs(root.right, result)


    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        # Solution1:
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
                stack.append(TypeNode(0,curr.node))
                stack.append(TypeNode(1,curr.node.left))

        return result


class TypeNode:
    def __init__(self,type,node):
        self.type = type  # 0 == output, 1 visit
        self.node = node