# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> List[List[int]]:
        # res = self.helper(root, targetSum)
        # for val in res:
        #     val.reverse()
        # if res == [[]]:
        #     return []
        # return res
        paths = []
        path = []
        self.dfs(root,targetSum,path, paths)
        return paths

    def dfs(self, node, remainingSum, cur_path, paths):

        if not node:
            return

        cur_path.append(node.val)

        if remainingSum == node.val and not node.left and not node.right:
            paths.append(cur_path[:])
        else:
            self.dfs(node.left, remainingSum-node.val,cur_path, paths)
            self.dfs(node.right, remainingSum-node.val,cur_path, paths)

        cur_path.pop()


    def helper(self, root, sums):
        if root == None:
            return [[]]

        if root.left == None and root.right == None:
            if sums == root.val:
                return [[root.val]]
            else:
                return [[]]

        leftRetList = self.helper(root.left, sums - root.val)
        rightRetList = self.helper(root.right, sums - root.val)

        res = []
        for left in leftRetList:
            if left:
                left.append(root.val)
                res.append(left)

        for right in rightRetList:
            if right:
                right.append(root.val)
                res.append(right)

        return res