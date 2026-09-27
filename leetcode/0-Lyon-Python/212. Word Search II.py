class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        if board is None or len(board) == 0:
            return []

        # pre-process
        # 预处理
        word_set = set(words)
        prefix_set = set()
        for word in words:
            for i in range(len(word)):
                prefix_set.add(word[:i + 1])

        result = set()
        for i in range(len(board)):
            for j in range(len(board[0])):
                c = board[i][j]
                self.search(board,i,j,board[i][j],word_set,prefix_set,set([(i, j)]),result,)

        return list(result)

    def search(self, board, x, y, word, word_set, prefix_set, visited, result):
        if word not in prefix_set:
            return

        if word in word_set:
            result.add(word)

        for delta_x, delta_y in  [(0, -1), (0, 1), (-1, 0), (1, 0)]:
            x_ = x + delta_x
            y_ = y + delta_y

            if not self.valid(board, x_, y_):
                continue
            if (x_, y_) in visited:
                continue

            visited.add((x_, y_))
            self.search(
                board,
                x_,
                y_,
                word + board[x_][y_],
                word_set,
                prefix_set,
                visited,
                result,
                )
            visited.remove((x_, y_))

    def valid(self, board, x, y):
        return 0 <= x < len(board) and 0 <= y < len(board[0])