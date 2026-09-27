class Solution:
    def combinationSum3(self, k: int, n: int) -> List[List[int]]:
        res = []
        nums = [i for i in range(1, 10)]
        self.dfs(nums, [], res, 0, k, n)
        return res


    def dfs(self, nums, temp, res, startIndex, k, target):
        if sum(temp) == target and len(temp) == k:
            res.append(temp + [])  #deepcopy
            return

        if  sum(temp) > target or len(temp) > k:
            return

        for i in range(startIndex, len(nums)):
            # 以startIndex对应数字开始
            num = nums[i]
            temp.append(num)
            self.dfs(nums, temp, res,  i+1, k, target)    # i or i+1
            temp.pop(-1)
