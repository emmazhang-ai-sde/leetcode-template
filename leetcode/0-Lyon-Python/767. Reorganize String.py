class Solution:
    def reorganizeString(self, s: str) -> str:
        if len(s) < 2:
            return s

        length = len(s)

        counts = {}
        for letter in s:
            counts[letter] = counts.get(letter, 0) + 1

        maxCount = max(counts.values())

        if maxCount > (length + 1) // 2:
            return ""

        heap = []
        for k,v in counts.items():
            heapq.heappush(heap, (-v, k))

        ans = []
        while len(heap) > 1:
            _, letter1 = heapq.heappop(heap)
            _, letter2 = heapq.heappop(heap)
            ans += [letter1, letter2]
            counts[letter1] -= 1
            counts[letter2] -= 1
            if counts[letter1] > 0:
                heapq.heappush(heap, (-counts[letter1], letter1))
            if counts[letter2] > 0:
                heapq.heappush(heap, (-counts[letter2], letter2))

        if heap:
            ans.append(heap[0][1])

        return "".join(ans)