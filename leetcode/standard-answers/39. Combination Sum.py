class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        res = []
        temp = []
        self.dfs(candidates, temp, res, target, 0)
        return res

    def dfs(self, candidates, temp, res, target, startIndex):
        if sum(temp) == target:
            res.append(temp + [])  #deepcopy
            return

        if sum(temp) > target: # early terminate
            return

        for i in range(startIndex, len(candidates)):      # startIndex 以startIndex对应数字开始
            num = candidates[i]
            temp.append(num)
            self.dfs(candidates, temp, res, target, i)    # i or i+1
            temp.pop(-1)