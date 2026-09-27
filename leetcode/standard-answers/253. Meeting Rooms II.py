class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        times = []
        for inter in intervals:
            times.append((inter[0], 1))
            times.append((inter[1], -1))
        ans, count = 0, 0
        times.sort()
        for t in times:
            count += t[1]
            ans = max(ans, count)
        return ans