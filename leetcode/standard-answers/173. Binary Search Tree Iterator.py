class TypeNode:
    def __init__(self, type, node):
        self.type = type #enums 0 1
        self.node = node

class BSTIterator:

    def __init__(self, root: Optional[TreeNode]):
        #edge
        if not root:
            return []

        res = []
        self.stack = []
        self.stack.append(TypeNode(1, root))#先访问root


    def next(self) -> int:

        while self.stack:
            cur = self.stack.pop()
            if cur.node == None:
                continue

            if cur.type == 0:#打印
                return cur.node.val
            else:#这里是从第三行到第一行这么看的。左中右
                self.stack.append(TypeNode(1, cur.node.right))#先访问右
                self.stack.append(TypeNode(0, cur.node))#把当前cur标记为可以打印
                self.stack.append(TypeNode(1, cur.node.left))#先访问左
        return 0
    def hasNext(self) -> bool:
        if len(self.stack) == 1:
            return self.stack[-1].node is not None
        else:
            return len(self.stack) > 0