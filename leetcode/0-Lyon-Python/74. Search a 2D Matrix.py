class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        if not matrix or not matrix[0]:
            return False

        row = len(matrix)
        col = len(matrix[0])

        start = 0
        end = row * col - 1

        while start + 1 < end:
            mid = (start + end) // 2
            if self.getValueFromIndex(mid, matrix) < target:
                start = mid
            elif self.getValueFromIndex(mid, matrix) > target:
                end = mid
            else:
                return True

        if self.getValueFromIndex(start, matrix) == target:
            return True

        if self.getValueFromIndex(end, matrix) == target:
            return True

        return False

    def getValueFromIndex(self, index, matrix):
        # index: 5 ->       matrix[1][1]
        column = len(matrix[0])
        row = index // column
        col = index % column
        return matrix[row][col]