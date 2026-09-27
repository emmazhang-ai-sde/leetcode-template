# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def constructFromPrePost(self, pre: List[int], post: List[int]) -> Optional[TreeNode]:
        if not pre:
            return None
        root = TreeNode(pre[0])
        if len(pre) == 1: return root

        L = post.index(pre[1]) + 1
        root.left = self.constructFromPrePost(pre[1:L+1], post[:L])
        root.right = self.constructFromPrePost(pre[L+1:], post[L:-1])
        return root


# 左子树 有L个node， 左子树node head是pre[1], 同时也是左子树后序遍历的最后一个[L-1]。
# 所以pre[1] = post[L-1]。
# 因此，L = post.indexOf(pre[1]) + 1。
# 在递归过程中，左边分支节点位于pre[1 : L + 1]和post[0 : L]中，右边分支节点位于pre[L+1 : N]和post[L : N-1]中。(不包括区间右端点)