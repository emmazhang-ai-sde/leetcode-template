class Solution:
    def findMedianSortedArrays(self, A: List[int], B: List[int]) -> float:
        n = len(B) + len(A)
        # Even
        if n % 2 == 0:
            ret = (
                          self.findkth(A,B, n//2) +
                          self.findkth(A,B, n//2+1)
                  )/2.0
        # Odd
        else:
            ret = self.findkth(A,B,n//2+1)

        return ret

    def findkth(self, A,B,k):
        if len(A) == 0:
            return B[k-1]

        if len(B) == 0:
            return A[k-1]

        if k == 1:
            return min(A[0], B[0])

        midA = A[k//2 - 1] if k//2 - 1 < len(A) else float('INF')
        midB = B[k//2 - 1] if k//2 - 1 < len(B) else float('INF')

        if midA < midB:
            return self.findkth(A[k//2:],B,k-k//2)
        else:
            return self.findkth(A,B[k//2:],k-k//2)