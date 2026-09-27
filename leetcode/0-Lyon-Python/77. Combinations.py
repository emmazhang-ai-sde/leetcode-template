class Solution:
    def combine(self, n: int, k: int) -> List[List[int]]:
        res = []
        nums = [i for i in range(1, n+1)]
        self.dfs(nums, [], res, 0, k)
        return res


    def dfs(self, nums, temp, res, startIndex, k):
        if len(temp) == k:
            res.append(temp + [])  #deepcopy
            return

        for i in range(startIndex, len(nums)):
            # 以startIndex对应数字开始
            num = nums[i]
            temp.append(num)
            self.dfs(nums, temp, res,  i+1, k)    # i or i+1
            temp.pop(-1)
