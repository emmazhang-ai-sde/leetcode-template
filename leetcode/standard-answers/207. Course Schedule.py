class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = collections.defaultdict(list)
        degree = [0 for i in range(numCourses)]

        for i,j in prerequisites:
            graph[j].append(i)
            degree[i] +=1

        queue = collections.deque([])
        res = []
        for course in range(numCourses):
            if degree[course] == 0:
                queue.append(course)
                res.append(course)

        while len(queue) > 0:
            size = len(queue)
            for _ in range(size):
                curr = queue.popleft()
                for next in graph[curr]:
                    degree[next]-=1
                    if degree[next] == 0:
                        queue.append(next)
                        res.append(next)

        return len(res) == numCourses








