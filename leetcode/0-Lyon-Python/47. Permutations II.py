class Solution:
    def permuteUnique(self, nums: List[int]) -> List[List[int]]:
        res = []
        temp = []
        visited = set()
        nums.sort()
        self.dfs(nums, temp, res, visited)
        return res;


    def dfs(self, nums, temp, res, visited):
        if len(temp) == len(nums):
            res.append(temp + [])  #deepcopy
            return

        for i in range(0, len(nums)):
            if i in visited:
                continue
            if i -1 >=0 and nums[i-1] == nums[i] and i-1 not in visited:
                continue
            num = nums[i]
            visited.add(i)
            temp.append(num)
            self.dfs(nums, temp, res, visited)
            visited.remove(i)
            temp.pop(-1)
