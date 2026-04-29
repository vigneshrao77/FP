import React, { useState } from 'react';

// Real LeetCode problems with direct URLs
const ALL_PROBLEMS = [
  { id: 1,   title: 'Two Sum',                                       slug: 'two-sum',                                          difficulty: 'Easy',   category: 'Arrays',              acceptance: '51.2%', submissions: '13.5M', tags: ['Array','Hash Table']            },
  { id: 9,   title: 'Palindrome Number',                             slug: 'palindrome-number',                                difficulty: 'Easy',   category: 'Math',                acceptance: '54.6%', submissions: '8.2M',  tags: ['Math']                         },
  { id: 20,  title: 'Valid Parentheses',                             slug: 'valid-parentheses',                                difficulty: 'Easy',   category: 'Stack',               acceptance: '40.1%', submissions: '5.6M',  tags: ['Stack','String']               },
  { id: 21,  title: 'Merge Two Sorted Lists',                        slug: 'merge-two-sorted-lists',                           difficulty: 'Easy',   category: 'Linked Lists',        acceptance: '62.8%', submissions: '4.9M',  tags: ['Linked List','Recursion']      },
  { id: 26,  title: 'Remove Duplicates from Sorted Array',           slug: 'remove-duplicates-from-sorted-array',              difficulty: 'Easy',   category: 'Arrays',              acceptance: '55.8%', submissions: '4.1M',  tags: ['Array','Two Pointers']         },
  { id: 53,  title: 'Maximum Subarray',                              slug: 'maximum-subarray',                                 difficulty: 'Medium', category: 'Dynamic Programming', acceptance: '50.3%', submissions: '5.8M',  tags: ['Array','DP','Divide & Conquer']},
  { id: 70,  title: 'Climbing Stairs',                               slug: 'climbing-stairs',                                  difficulty: 'Easy',   category: 'Dynamic Programming', acceptance: '52.4%', submissions: '4.7M',  tags: ['Math','DP','Memoization']      },
  { id: 94,  title: 'Binary Tree Inorder Traversal',                 slug: 'binary-tree-inorder-traversal',                    difficulty: 'Easy',   category: 'Trees',               acceptance: '74.8%', submissions: '3.2M',  tags: ['Tree','DFS','Binary Tree']     },
  { id: 121, title: 'Best Time to Buy and Sell Stock',               slug: 'best-time-to-buy-and-sell-stock',                  difficulty: 'Easy',   category: 'Arrays',              acceptance: '54.5%', submissions: '6.1M',  tags: ['Array','DP']                   },
  { id: 136, title: 'Single Number',                                 slug: 'single-number',                                    difficulty: 'Easy',   category: 'Bit Manipulation',    acceptance: '71.0%', submissions: '3.4M',  tags: ['Array','Bit Manipulation']     },
  { id: 141, title: 'Linked List Cycle',                             slug: 'linked-list-cycle',                                difficulty: 'Easy',   category: 'Linked Lists',        acceptance: '49.5%', submissions: '3.0M',  tags: ['Hash Table','Two Pointers']    },
  { id: 155, title: 'Min Stack',                                     slug: 'min-stack',                                        difficulty: 'Medium', category: 'Stack',               acceptance: '53.2%', submissions: '2.2M',  tags: ['Stack','Design']               },
  { id: 160, title: 'Intersection of Two Linked Lists',              slug: 'intersection-of-two-linked-lists',                 difficulty: 'Easy',   category: 'Linked Lists',        acceptance: '56.2%', submissions: '2.5M',  tags: ['Hash Table','Two Pointers']    },
  { id: 169, title: 'Majority Element',                              slug: 'majority-element',                                 difficulty: 'Easy',   category: 'Arrays',              acceptance: '64.0%', submissions: '3.3M',  tags: ['Array','Hash Table','Sort']    },
  { id: 200, title: 'Number of Islands',                             slug: 'number-of-islands',                                difficulty: 'Medium', category: 'Graph',               acceptance: '57.9%', submissions: '3.1M',  tags: ['BFS','DFS','Union Find']       },
  { id: 206, title: 'Reverse Linked List',                           slug: 'reverse-linked-list',                              difficulty: 'Easy',   category: 'Linked Lists',        acceptance: '74.6%', submissions: '5.0M',  tags: ['Linked List','Recursion']      },
  { id: 215, title: 'Kth Largest Element in an Array',               slug: 'kth-largest-element-in-an-array',                  difficulty: 'Medium', category: 'Arrays',              acceptance: '65.8%', submissions: '2.4M',  tags: ['Array','Heap','Sort']          },
  { id: 226, title: 'Invert Binary Tree',                            slug: 'invert-binary-tree',                               difficulty: 'Easy',   category: 'Trees',               acceptance: '76.8%', submissions: '2.7M',  tags: ['Tree','BFS','DFS']             },
  { id: 234, title: 'Palindrome Linked List',                        slug: 'palindrome-linked-list',                           difficulty: 'Easy',   category: 'Linked Lists',        acceptance: '50.5%', submissions: '2.6M',  tags: ['Linked List','Two Pointers']   },
  { id: 238, title: 'Product of Array Except Self',                  slug: 'product-of-array-except-self',                     difficulty: 'Medium', category: 'Arrays',              acceptance: '64.9%', submissions: '2.3M',  tags: ['Array','Prefix Sum']           },
  { id: 242, title: 'Valid Anagram',                                 slug: 'valid-anagram',                                    difficulty: 'Easy',   category: 'Strings',             acceptance: '63.6%', submissions: '3.5M',  tags: ['Hash Table','String','Sort']   },
  { id: 268, title: 'Missing Number',                                slug: 'missing-number',                                   difficulty: 'Easy',   category: 'Math',                acceptance: '64.5%', submissions: '2.8M',  tags: ['Array','Math','Bit Manip.']    },
  { id: 283, title: 'Move Zeroes',                                   slug: 'move-zeroes',                                      difficulty: 'Easy',   category: 'Arrays',              acceptance: '61.4%', submissions: '3.9M',  tags: ['Array','Two Pointers']         },
  { id: 322, title: 'Coin Change',                                   slug: 'coin-change',                                      difficulty: 'Medium', category: 'Dynamic Programming', acceptance: '43.3%', submissions: '3.0M',  tags: ['Array','DP','BFS']             },
  { id: 338, title: 'Counting Bits',                                 slug: 'counting-bits',                                    difficulty: 'Easy',   category: 'Bit Manipulation',    acceptance: '76.0%', submissions: '1.8M',  tags: ['DP','Bit Manipulation']        },
  { id: 344, title: 'Reverse String',                                slug: 'reverse-string',                                   difficulty: 'Easy',   category: 'Strings',             acceptance: '76.7%', submissions: '3.1M',  tags: ['Two Pointers','String','Rec.'] },
  { id: 347, title: 'Top K Frequent Elements',                       slug: 'top-k-frequent-elements',                          difficulty: 'Medium', category: 'Arrays',              acceptance: '65.1%', submissions: '1.9M',  tags: ['Array','Hash Table','Heap']    },
  { id: 394, title: 'Decode String',                                 slug: 'decode-string',                                    difficulty: 'Medium', category: 'Strings',             acceptance: '58.1%', submissions: '1.2M',  tags: ['Stack','String','Recursion']   },
  { id: 409, title: 'Longest Palindrome',                            slug: 'longest-palindrome',                               difficulty: 'Easy',   category: 'Strings',             acceptance: '53.9%', submissions: '1.1M',  tags: ['Hash Table','String','Greedy'] },
  { id: 412, title: 'Fizz Buzz',                                     slug: 'fizz-buzz',                                        difficulty: 'Easy',   category: 'Math',                acceptance: '68.6%', submissions: '2.7M',  tags: ['Math','String','Simulation']   },
  { id: 437, title: 'Path Sum III',                                  slug: 'path-sum-iii',                                     difficulty: 'Medium', category: 'Trees',               acceptance: '48.0%', submissions: '0.8M',  tags: ['Tree','DFS','Prefix Sum']      },
  { id: 448, title: 'Find All Numbers Disappeared in an Array',      slug: 'find-all-numbers-disappeared-in-an-array',         difficulty: 'Easy',   category: 'Arrays',              acceptance: '60.6%', submissions: '1.5M',  tags: ['Array','Hash Table']           },
  { id: 543, title: 'Diameter of Binary Tree',                       slug: 'diameter-of-binary-tree',                          difficulty: 'Easy',   category: 'Trees',               acceptance: '57.5%', submissions: '1.6M',  tags: ['Tree','DFS','Binary Tree']     },
  { id: 560, title: 'Subarray Sum Equals K',                         slug: 'subarray-sum-equals-k',                            difficulty: 'Medium', category: 'Arrays',              acceptance: '43.6%', submissions: '1.4M',  tags: ['Array','Hash Table','Prefix Sum']},
  { id: 572, title: 'Subtree of Another Tree',                       slug: 'subtree-of-another-tree',                          difficulty: 'Easy',   category: 'Trees',               acceptance: '46.2%', submissions: '1.1M',  tags: ['Tree','DFS','Binary Tree']     },
  { id: 617, title: 'Merge Two Binary Trees',                        slug: 'merge-two-binary-trees',                           difficulty: 'Easy',   category: 'Trees',               acceptance: '77.4%', submissions: '1.3M',  tags: ['Tree','DFS','BFS']             },
  { id: 704, title: 'Binary Search',                                 slug: 'binary-search',                                    difficulty: 'Easy',   category: 'Binary Search',       acceptance: '56.0%', submissions: '2.3M',  tags: ['Array','Binary Search']        },
  { id: 733, title: 'Flood Fill',                                    slug: 'flood-fill',                                       difficulty: 'Easy',   category: 'Graph',               acceptance: '62.9%', submissions: '1.2M',  tags: ['Array','DFS','BFS','Matrix']   },
  { id: 739, title: 'Daily Temperatures',                            slug: 'daily-temperatures',                               difficulty: 'Medium', category: 'Stack',               acceptance: '66.8%', submissions: '1.5M',  tags: ['Array','Stack','Monotonic']    },
  { id: 876, title: 'Middle of the Linked List',                     slug: 'middle-of-the-linked-list',                        difficulty: 'Easy',   category: 'Linked Lists',        acceptance: '75.9%', submissions: '1.5M',  tags: ['Linked List','Two Pointers']   },
  { id: 977, title: 'Squares of a Sorted Array',                     slug: 'squares-of-a-sorted-array',                        difficulty: 'Easy',   category: 'Arrays',              acceptance: '71.8%', submissions: '2.0M',  tags: ['Array','Two Pointers','Sort']  },
  { id: 1,   title: 'Merge Intervals',                               slug: 'merge-intervals',                                  difficulty: 'Medium', category: 'Arrays',              acceptance: '46.5%', submissions: '2.1M',  tags: ['Array','Sort']                 },
  { id: 3,   title: 'Longest Substring Without Repeating Characters',slug: 'longest-substring-without-repeating-characters',   difficulty: 'Medium', category: 'Strings',             acceptance: '33.9%', submissions: '8.1M',  tags: ['Sliding Window','Hash Table']  },
  { id: 23,  title: 'Merge k Sorted Lists',                          slug: 'merge-k-sorted-lists',                             difficulty: 'Hard',   category: 'Linked Lists',        acceptance: '50.8%', submissions: '2.4M',  tags: ['Linked List','Heap','Merge']   },
  { id: 42,  title: 'Trapping Rain Water',                           slug: 'trapping-rain-water',                              difficulty: 'Hard',   category: 'Arrays',              acceptance: '60.1%', submissions: '2.8M',  tags: ['Array','DP','Two Pointers']    },
  { id: 76,  title: 'Minimum Window Substring',                      slug: 'minimum-window-substring',                         difficulty: 'Hard',   category: 'Strings',             acceptance: '41.4%', submissions: '1.6M',  tags: ['Hash Table','Sliding Window']  },
  { id: 84,  title: 'Largest Rectangle in Histogram',                slug: 'largest-rectangle-in-histogram',                   difficulty: 'Hard',   category: 'Stack',               acceptance: '43.7%', submissions: '1.2M',  tags: ['Array','Stack','Monotonic']    },
  { id: 124, title: 'Binary Tree Maximum Path Sum',                  slug: 'binary-tree-maximum-path-sum',                     difficulty: 'Hard',   category: 'Trees',               acceptance: '38.8%', submissions: '1.5M',  tags: ['Tree','DFS','Binary Tree']     },
  { id: 146, title: 'LRU Cache',                                     slug: 'lru-cache',                                        difficulty: 'Medium', category: 'Design',              acceptance: '41.7%', submissions: '1.9M',  tags: ['Hash Table','Linked List']     },
  { id: 295, title: 'Find Median from Data Stream',                  slug: 'find-median-from-data-stream',                     difficulty: 'Hard',   category: 'Design',              acceptance: '51.4%', submissions: '0.9M',  tags: ['Heap','Data Stream','Design']  },
  { id: 297, title: 'Serialize and Deserialize Binary Tree',         slug: 'serialize-and-deserialize-binary-tree',            difficulty: 'Hard',   category: 'Trees',               acceptance: '55.7%', submissions: '0.7M',  tags: ['Tree','DFS','BFS','Design']    },
];

// Deduplicate by slug
const PROBLEMS = Array.from(new Map(ALL_PROBLEMS.map(p => [p.slug, p])).values());

const CATEGORIES = ['All', 'Arrays', 'Strings', 'Trees', 'Linked Lists', 'Stack', 'Dynamic Programming', 'Graph', 'Math', 'Design', 'Binary Search', 'Bit Manipulation'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const PAGE_SIZE = 15;

const LC_URL = (slug) => `https://leetcode.com/problems/${slug}/`;

const Problems = () => {
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory]     = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage]             = useState(1);

  const filtered = PROBLEMS.filter(p => {
    const matchDiff = difficulty === 'all' || p.difficulty.toLowerCase() === difficulty;
    const matchCat  = category  === 'all' || p.category.toLowerCase() === category.toLowerCase();
    const matchSrch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchDiff && matchCat && matchSrch;
  });

  const totalPages   = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated    = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearchTerm(val); setPage(1); };
  const handleDiff   = (val) => { setDifficulty(val); setPage(1); };
  const handleCat    = (val) => { setCategory(val);   setPage(1); };

  const diffColor = (d) =>
    d === 'Easy' ? 'difficulty-easy' : d === 'Medium' ? 'difficulty-medium' : 'difficulty-hard';

  const easyCount   = filtered.filter(p => p.difficulty === 'Easy').length;
  const mediumCount = filtered.filter(p => p.difficulty === 'Medium').length;
  const hardCount   = filtered.filter(p => p.difficulty === 'Hard').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LeetCode Problems</h1>
        <p className="text-gray-600">
          Browse {PROBLEMS.length} real LeetCode problems — click any to open on LeetCode
        </p>
      </div>

      {/* Summary badges */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
          {filtered.length} problems
        </span>
        <span className="px-3 py-1 difficulty-easy text-sm rounded-full font-medium">{easyCount} Easy</span>
        <span className="px-3 py-1 difficulty-medium text-sm rounded-full font-medium">{mediumCount} Medium</span>
        <span className="px-3 py-1 difficulty-hard text-sm rounded-full font-medium">{hardCount} Hard</span>
        <a
          href="https://leetcode.com/problemset/"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto px-4 py-1 bg-orange-500 text-white text-sm rounded-full font-semibold hover:bg-orange-600 transition flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.112-.661 1.824-.661s1.357.194 1.824.661l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.536.553-1.387.038-1.9l-2.609-2.519c-.756-.756-1.787-1.184-2.85-1.184s-2.094.428-2.85 1.184L5.76 11.16c-.756.756-1.185 1.787-1.185 2.85s.429 2.094 1.185 2.85l4.319 4.363c.756.756 1.787 1.184 2.85 1.184s2.094-.428 2.85-1.184l2.609-2.519c.515-.514.497-1.365-.038-1.9-.535-.535-1.386-.553-1.248.038z"/>
          </svg>
          Open LeetCode
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Problem name or tag..."
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={difficulty}
              onChange={e => handleDiff(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {DIFFICULTIES.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={e => handleCat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {CATEGORIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solve</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No problems found. Try adjusting your filters.
                  </td>
                </tr>
              ) : paginated.map((problem) => (
                <tr key={problem.slug} className="hover:bg-orange-50 transition-colors group">
                  <td className="px-4 py-3 text-sm text-gray-400 font-mono">{problem.id}</td>
                  <td className="px-4 py-3">
                    <a
                      href={LC_URL(problem.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors"
                    >
                      {problem.title}
                    </a>
                    <p className="text-xs text-gray-400 mt-0.5">{problem.category}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {problem.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${diffColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{problem.acceptance}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a
                      href={LC_URL(problem.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                      </svg>
                      Solve
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40"
          >
            ← Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const pg = page <= 4 ? i + 1 : page + i - 3;
            if (pg < 1 || pg > totalPages) return null;
            return (
              <button
                key={pg}
                onClick={() => setPage(pg)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${pg === page ? 'bg-purple-600 text-white border border-purple-600' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'}`}
              >
                {pg}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Problems;
