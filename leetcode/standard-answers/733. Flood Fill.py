class Solution:
    def floodFill(self, image: List[List[int]], sr: int, sc: int, newColor: int) -> List[List[int]]:
        self.dfs(image, sr,sc, newColor, image[sr][sc])
        return image

    def dfs(self, image, i, j , newColor, oldColor):

        image[i][j] = newColor

        for (dx,dy) in [(0,1),(0,-1),(1,0),(-1,0)]:
            newx = i + dx
            newy = j + dy
            if  not (0<= newx < len(image) and 0<=newy < len(image[0])):
                continue
            if  image[newx][newy] == newColor:
                continue
            if image[newx][newy] != oldColor:
                continue

            self.dfs(image, newx,newy, newColor, oldColor)