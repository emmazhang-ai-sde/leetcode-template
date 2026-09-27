class Solution:
    def minLength(self, word):
        maps = {}
        for k in word:
            maps[k] = maps.get(k,0) + 1
#         maps = {k: v for k, v in sorted(maps.items(), key=lambda item: (item[1], item[0])) }
        print(maps)
        for k,v in maps.items():
            if v % 2 == 0:
                word = word.replace(k, '')
            else:
#                 print("before", word)
                word = word.replace(k, '', v-1)
#                 print("after:", word)
        print(word)

# newMap = {k: v for k, v in sorted(maps.items(), key=lambda item: (item[1], item[0])) }
word = "AKFKFMOGKFB"
res = Solution()
res.minLength(word)  # Output should be [3, 0, 2]
# AFKMOGB
# BzaaazzC

# BzazaazC

# BazC

# BzaaazzC

import heapq
def Solution2(s):
    a = [0]
    n = len(s)

    for i in range(n):
        a.append(ord(s[i]) - 64)
    print("a:",a)

    c = [0] * 30
    for i in range(1, n+1):
        c[a[i]] +=1

    print("c:",c)

    ss = set()
    for i in range(1, 27):
        if c[i] %2 == 1:
            ss.add(i)

    print("ss:", ss)

    mx = [-1] * 28
    mn = [10 ** 9] * 28
    for i in range(1, n+1):
        if a[i] in ss:
            mn[a[i]] = min(mn[a[i]], i)
            mx[a[i]] = max(mx[a[i]], i)

    for u in ss:
        print(chr(u+64),mn[u], mx[u])

    v = [[] for i in range(30)]
    d = [0] * 30

    for i in range(1,27):
        if i not in ss:
            continue
        for j in range(1,27):
            if j not in ss:
                continue
            if i == j:
                continue
            if mx[i] < mn[j]:
                v[i].append(j)
                d[j] += 1
    print("v:",v)
    print("d:",d)

    q = []

    for u in ss:
        if d[u] == 0:
            heapq.heappush(q,u)
    ret = ''

    while len(q) > 0:
        x =  heapq.heappop(q)
        ch = chr(x + 64)
        ret += ch

        for u in v[x]:
            d[u] -= 1
            if d[u] == 0:
               heapq.heappush(q,u)
    return ret

print(Solution2('AKFKFMOGKFB'))
# print(Solution2('CBCAAXA'))