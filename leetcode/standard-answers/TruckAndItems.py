class Solution:
                               # M + MLGM + N * LGM = (M + N) * LGM
    def getTrucksForItems(self, trucks, items):    # M trucks N items
        res = []
        for index, capacity in enumerate(trucks):          # O(M)
            res.append((capacity, index))

        paired_trucks = sorted(res)                     #   O MLGM
        print(paired_trucks)
        ans = []
        for item in items:                              # O N
            index = self.firstLargerThanTarget(item, paired_trucks)  # O LGM
            ans.append(index)
        return ans
    def firstLargerThanTarget(self, target, nums):
        start = 0
        end = len(nums) - 1

        while start + 1 < end:
            mid = (start + end) // 2
            if nums[mid][0] < target:
                start = mid
            elif nums[mid][0] > target:
                end = mid
            else:
                start = mid

        if nums[start][0] > target:
            return nums[start][1]

        if nums[end][0] > target:
            return nums[end][1]

        return -1

#     def lastSmallerThanTarget(self, target, nums):
#        start = 0
#        end = len(nums) - 1
#
#        while start + 1 < end:
#            mid = (start + end) // 2
#            if nums[mid][0] < target:
#                start = mid
#            elif nums[mid][0] > target:
#                end = mid
#            else:
#                end = mid
#
#        if nums[end][0] < target:
#            return nums[end][1]
#
#        if nums[start][0] < target:
#            return nums[start][1]
#
#        return -1
#
# #   N + NLGN + MLGN = (N+M) LGN
#     def getItemsForTruck(self, trucks, items):    # M trucks N items
#        res = []
#        for index, capacity in enumerate(items):          # O N
#            res.append((capacity, index))
#
#        paired_items = sorted(res)                     #   O NLGN
#        print(paired_items)
#
#        result = [float('INF')] * len(items)                  # O N
#        for index, truck in enumerate(trucks):                              # O M
#             item_item_index = self.lastSmallerThanTarget(truck, paired_items)    # O LGN
#
#             if result[item_item_index] == float('INF'):
#                 result[item_item_index] = index
#             else:
#                 trucks_index = result[item_item_index]
#                 if trucks[index] < trucks[trucks_index]:
#                     result[item_item_index] = index
#
#        for index, res in enumerate(result):
#             if res == float('INF'):
#                 result[index] = trucks.index(min(trucks))
#
#        return result

trucks = [4, 5, 7, 2]
items = [1,1,1,1,2,5]

res = Solution()
print(res.getTrucksForItems(trucks, items))  # Output should be [3, 0, 2]
# print(res.getItemsForTruck(trucks, items))  # Output should be [3, 0, 2]

