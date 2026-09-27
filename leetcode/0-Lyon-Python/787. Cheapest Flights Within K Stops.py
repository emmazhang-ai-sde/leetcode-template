class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, K: int) -> int:
        adj = collections.defaultdict(list)
        for u, v, w in flights:
            adj[u].append((v,w))

        stops = [float('inf')] * n

        # pq = PriorityQueue()
        pq = [(0, src, 0)]
        # price, node, stop

        while len(pq) > 0:
            price, node, stop = heapq.heappop(pq)
            if stop >  stops[node] or stop > K + 1:
                continue
            stops[node] = stop

            if node == dst:
                return price

            for new_node, new_price  in adj[node]:
                heappush(pq, (new_price + price, new_node, stop + 1))
        return -1