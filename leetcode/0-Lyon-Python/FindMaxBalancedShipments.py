#
# Maximum Number of Balanced Shipments
# Amazon has multiple delivery centers for the distribution of its goods. In one such center, parcels are arranged in a sequence where the ith parcel has a weight of weight[i].
#
# A shipment is constituted of a contiguous segment of parcels in this arrangement. That is, for 3 parcels arranged with weights [3, 6, 3] a shipment can be formed of parcels with weights [3], [6], [3], [3, 6], [6, 3] and [3, 6, 3] but not with weights [3, 3]. These shipments are to be loaded for delivery and must be balanced.
#
# A shipment is said to be balanced if the weight of the last parcel of the shipment is not the maximum weight among all the weights in that shipment. For example, shipment with weights [3, 9, 4, 7] is balanced since the last weight is 7, while the maximum shipment weight is 9. However, the shipment [4, 7, 2, 7] is not balanced.
#
# Given the weights of n parcels placed in a sequence, find the maximum number of shipments that can be formed such that each parcel belongs to exactly one shipment, each shipment consists of only a contiguous segment of parcels, and each shipment is balanced. If there are no balanced shipments, return 0.
#
# Function Description
#
# Complete the function maxNumberOfBalancedShipments in the editor.
#
# maxNumberOfBalancedShipments has the following parameter:
#
# int[] weights: an array of integers representing the weights of the parcels
# Returns
#
# int: the maximum number of balanced shipments that can be formed
#
# Example 1:
#
# Input:  weights = [1, 2, 3, 2,/ 6, 3/ , 1]
                     -1 -1 2  -1  3  1  -1
8  4/  3 6 5 /3 4 7  1   ====>2
       1
       5


8  4 /  3 6 5/ 3 4 7  1



 # Output: 2
# Explanation:
#
# There are n = 6 parcels to ship. The parcels can be divided into two shipments:
#
# [1, 2, 3, 2] and [6, 3]
#
# each of which is balanced.
from typing import List

class Solution:
    def maxNumberOfBalancedShipments(self, weight: List[int]) -> int:
        if not weight or len(weight) == 0 or len(weight) == 1:
            return 0

        n = len(weight)
        nextMap = {}
        stack = []

        for i, val in enumerate(weight):
            while stack and weight[stack[-1]] > val:
                stacktop = stack.pop()
                nextMap[stacktop] = i
            stack.append(i)

        maps = {}
        maps[n] = 0      # 分完N个item之后，剩下的货物最多几种分法
        def dp(i, maps, nextMap):
            if i in maps:
                return maps[i]
            maps[i] = 0
            if i in nextMap:
                maps[i] = dp(nextMap[i] + 1, maps, nextMap) + 1
            maps[i] = max(maps[i], dp(i+1, maps, nextMap))
            return maps[i]
        dp(0, maps, nextMap)
        return maps[0]

sol = Solution()

weight =  [1, 2, 3, 2, 6, 3]
res = sol.maxNumberOfBalancedShipments(weight)
print(res)

