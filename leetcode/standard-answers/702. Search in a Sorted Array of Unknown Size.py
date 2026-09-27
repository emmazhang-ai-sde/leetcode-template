# """
# This is ArrayReader's API interface.
# You should not implement it, or speculate about its implementation
# """
#class ArrayReader:
#    def get(self, index: int) -> int:


class Solution:
    def search(self, reader: 'ArrayReader', target: int) -> int:
        # ERR = 2 ** 31 - 1
        left = 0
        right = 1
        while  reader.get(right) < target:
            left = right
            right = right * 2

        # Target is between left, right

        while left + 1 < right:
            mid = (left + right) // 2
            if reader.get(mid) < target:
                left = mid
            else:
                right = mid

        if reader.get(left) == target:
            return left

        if reader.get(right) == target:
            return right

        return -1
