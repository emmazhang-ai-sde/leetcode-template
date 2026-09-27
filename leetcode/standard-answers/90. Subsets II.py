class Solution:
    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:
        path = []
        result = []
        nums.sort()
        self.dfs(nums, path, result, 0)
        return result

    def dfs(self, nums, path, result, index):

        result.append(path + [])

        for i in range(index,len(nums)):
            if i>index and nums[i] == nums[i-1]:
                continue
            path.append(nums[i])
            self.dfs(nums,path,result,i+1)
            path.pop(-1)