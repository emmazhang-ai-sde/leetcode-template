class Solution:
    def mySqrt(self, x: int) -> int:

        left, right = 0, x
        while left + 1 < right:
            mid = (left + right) // 2
            if self.isValid(mid, x):
                left = mid
            else:
                right = mid

        if right * right == x:
            return right
        else:
            return left

    def isValid(self, num, x ):
        return num * num <= x


    def Sqrt2(self, x: int) -> int:
        l = 0
        r = max(x,1)
        e = 1e-10
        while l + e < r:
            mid = l + (r - l) / 2.0
            if mid * mid < x:
                l = mid
            else:
                r = mid

        if r * r <= x:
            return r
        else:
            return l