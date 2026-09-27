import collections
class Solution:
    def findLadders(self, beginWord: str, endWord: str, wordList: List[str]) -> List[List[str]]:
        # Create Graph
        graph = collections.defaultdict(list)
        wordList.append(beginWord)
        for word in wordList:
            graph[word] = self.get_neighbour(word, set(wordList))

        # Go through graph to init distance from end to all other words
        dist = {}
        self.bfs(endWord, dist, graph)
        result = []
        self.dfs(dist, graph, beginWord, endWord, [beginWord], result)
        return result

    def get_neighbour(self, word, wordList):  # O(26 * L^2)
        res = []
        for index,letter in enumerate(word):          # O (L)
            for replaceLetter in "abcdefghijklmnopqrstuvwxyz": # O(25)
                if letter != replaceLetter:
                    newWord = word[:index] + replaceLetter + word[index+1:] #O(L)
                    if newWord in wordList:
                        res.append(newWord)
        return res

    def bfs(self, start, dist, graph):
        queue = collections.deque([start])
        dist[start] = 0
        while queue:
            word = queue.popleft()
            for next_word in graph[word]:
                if next_word not in dist:
                    dist[next_word] = dist[word] + 1
                    queue.append(next_word)

    def dfs(self, dist, graph, beginWord, endWord, temp, result):
        if beginWord == endWord:
            result.append(temp + [])
            return

        neighbours = graph[beginWord]
        for neighbour in neighbours:
            if dist.get(neighbour, 0) != dist.get(beginWord, 0) - 1:
                continue
            temp.append(neighbour)
            self.dfs(dist, graph, neighbour, endWord, temp, result)
            temp.pop(-1)