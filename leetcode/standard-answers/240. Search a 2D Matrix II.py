class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        if not matrix or not matrix[0]:
            return False

        col = len(matrix[0]);
        row = len(matrix);

        i = 0;
        j = col-1;

        while ( row>i>=0 and 0<=j<col):
            if matrix[i][j] == target:
                return True;

            if matrix[i][j] < target:
                i+=1;
            else:
                j-=1;

        return False;