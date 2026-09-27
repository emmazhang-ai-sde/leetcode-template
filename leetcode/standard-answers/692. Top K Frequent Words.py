class Item:
    def __init__(self, freq, word):
        self.freq = freq
        self.word = word

    def __lt__(self, other):
        if self.freq == other.freq:
            return self.word > other.word
        return self.freq < other.freq

class Solution:
    def topKFrequent(self, words: List[str], k: int) -> List[str]:
        maps = {}
        for i in words:
            maps[i] = maps.get(i,0) + 1

        heap = []

        for word, count in maps.items():
            heapq.heappush(heap, Item(count,word))
            if len(heap) > k:
                heapq.heappop(heap)

        res = []
        for _ in range(k):
            res.append(heapq.heappop(heap).word)

        return res[::-1]

        # (2,love)
        # (2, i)_
        # (1, a)
        # (1,a)（2，i） (2,love)