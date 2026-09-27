class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        temp = []
        res = []
        visited = set()
        self.dfs(nums, temp, res, visited)
        return res;


    def dfs(self, nums, temp, res, visited):
        if len(temp) == len(nums):
            res.append(temp + [])  #deepcopy
            return

        for i in range(0, len(nums)):
            if i in visited:
                continue
            num = nums[i]
            visited.add(i)
            temp.append(num)
            self.dfs(nums, temp, res, visited)
            visited.remove(i)
            temp.pop(-1)
