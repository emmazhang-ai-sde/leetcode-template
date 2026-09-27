class Solution:
    def canFinish(self, piles, h, speed):
        time = 0
        for pile in piles:
            time += pile // speed
            if pile % speed != 0:
                time += 1
        return time <= h

    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        # Example 1: speed: 1 ~ 11
        start = 1
        end = max(piles)

        while start + 1 < end:
            mid = (start + end) // 2
            if self.canFinish(piles, h, mid):
                end = mid
            else:
                start = mid

        if self.canFinish(piles, h, start):
            return start
        return end