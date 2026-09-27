class Solution:
    def alienOrder(self, words: List[str]) -> str:
        graph = collections.defaultdict(list)
        degree = {}  #key letter value :  indegree

        for word in words:
            for ch in word:
                if ch not in graph:
                    degree[ch] = 0

        for i in range(len(words) - 1):
            word_pre = words[i]
            word_curr = words[i+1]

            if len(word_pre) > len(word_curr) and word_pre.startswith(word_curr):
                return ""

            m = min(len(word_pre), len(word_curr))

            for j in range(m):
                from_letter = word_pre[j]
                to_letter = word_curr[j]
                if from_letter != to_letter:
                    if to_letter not in graph[from_letter]:
                        graph[from_letter].append(to_letter)
                        degree[to_letter] +=1
                    break

        queue = []

        for key,val in degree.items():
            if val == 0:
                queue.append(key)

        res = []
        while queue:
            curr = queue.pop(0)
            res.append(curr)
            for neighbour in graph[curr]:
                degree[neighbour]-=1
                if degree[neighbour] == 0:
                    queue.append(neighbour)

        if len(res) != len(degree):
            return ""
        return "".join(res)