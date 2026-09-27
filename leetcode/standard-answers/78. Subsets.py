class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        path = []
        result = []
        self.dfs(nums, path, result, 0)
        return result

    def dfs(self, nums, path, result, index):
        newPath = path + []
        result.append(newPath)

        for i in range(index,len(nums)):
            path.append(nums[i])
            self.dfs(nums,path,result,i+1)
            path.pop(-1)