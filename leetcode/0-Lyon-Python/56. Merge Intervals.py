class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort()
        res = []

        for i, curr in enumerate(intervals):
            if i == 0:
                pre = curr
                continue
            if  curr[0] > pre[1]:
                res.append(pre)
                pre = curr
            else:
                pre[1] = max(pre[1], curr[1])

        res.append(pre)
        return res