class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        if not board or not board[0]:
            return False

        visited = set()

        for i in range(len(board)):
            for j in range(len(board[0])):
                if self.dfs(i, j, board, 0, word, visited):
                    return True
        return False

    def dfs(self, i, j, board, index, word, visited):

        if index < len(word) and word[index] != board[i][j]:
            return False

        if index == len(word) - 1:
            return True

        visited.add((i,j))

        for (di, dj) in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            newi = i + di
            newj = j + dj
            if not ( 0<=newi<len(board) and 0<=newj<len(board[0])):
                continue
            if (newi,newj) in visited:
                continue
            if self.dfs(newi, newj, board, index + 1, word, visited):
                return True

        visited.remove((i,j))
