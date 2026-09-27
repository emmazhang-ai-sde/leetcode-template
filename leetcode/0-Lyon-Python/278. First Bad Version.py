# The isBadVersion API is already defined for you.
def isBadVersion(version: int) -> bool:
    return 1

class Solution:
    def firstBadVersion(self, n: int) -> int:
        start = 1
        end = n

        while start + 1 < end:
            mid = start + (end - start) // 2
            if isBadVersion(mid):
                end = mid
            else:
                start = mid
        if  isBadVersion(start):
            return start

        return end