# Definition for a binary tree node.
# class TreeNode(object):
#     def __init__(self, x):
#         self.val = x
#         self.left = None
#         self.right = None

class Codec:

    def serialize(self, root):
        """Encodes a tree to a single string.

        :type root: TreeNode
        :rtype: str
        """
        if root is None:
            return ""

        ret = []
        ret.append(str(root.val))

        queue = [root]

        while len(queue) > 0:
            curr = queue.pop(0)
            if curr.left:
                queue.append(curr.left)
                ret.append(str(curr.left.val))
            else:
                ret.append('#')

            if curr.right:
                queue.append(curr.right)
                ret.append(str(curr.right.val))
            else:
                ret.append('#')

        while ret[-1] == '#':
            ret.pop(-1)

        return ",".join(ret)



    def deserialize(self, data):
        """Decodes your encoded data to tree.

        :type data: str
        :rtype: TreeNode
        """
        if len(data) == 0:
            return None

        nums = data.split(",")

        root = TreeNode(nums[0])

        # def buildTree(index,nums):
        #     if index >= len(nums):
        #         return
        #     node = TreeNode(nums[index])

        #     left = buildTree(index*2+1, nums)
        #     right = buildTree(index*2 + 2, nums)

        #     node.left = left
        #     node.right = right

        #     return node

        # return buildTree(0,nums)

        queue = [root]
        i = 1

        while  i < len(nums) and len(queue) > 0:
            curr = queue.pop(0)
            if i < len(nums) and nums[i] != "#":
                curr.left = TreeNode(nums[i])
                queue.append(curr.left)
            i +=1

            if  i < len(nums) and nums[i] != "#":
                curr.right = TreeNode(nums[i])
                queue.append(curr.right)
            i+=1


        return root



# Your Codec object will be instantiated and called as such:
# codec = Codec()
# codec.deserialize(codec.serialize(root))
