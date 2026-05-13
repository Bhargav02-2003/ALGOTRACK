/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  youtubeUrl: string;
  practiceUrl: string;
  articleUrl: string;
}

export interface Chapter {
  id: string;
  title: string;
  problems: Problem[];
}

export const DSA_SHEET: Chapter[] = [
  {
    id: 'arrays',
    title: 'Arrays & Hashing',
    problems: [
      {
        id: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        youtubeUrl: 'https://www.youtube.com/results?search_query=two+sum+dsa',
        practiceUrl: 'https://leetcode.com/problems/two-sum/',
        articleUrl: 'https://takeuforward.org/data-structure/two-sum-check-if-a-pair-with-given-sum-exists-in-array/',
      },
      {
        id: 'valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'Easy',
        youtubeUrl: 'https://www.youtube.com/results?search_query=valid+anagram+dsa',
        practiceUrl: 'https://leetcode.com/problems/valid-anagram/',
        articleUrl: 'https://takeuforward.org/data-structure/check-if-two-strings-are-anagram-of-each-other/',
      },
      {
        id: 'contains-duplicate',
        title: 'Contains Duplicate',
        difficulty: 'Easy',
        youtubeUrl: 'https://www.youtube.com/results?search_query=contains+duplicate+dsa',
        practiceUrl: 'https://leetcode.com/problems/contains-duplicate/',
        articleUrl: 'https://takeuforward.org/data-structure/check-if-a-number-is-a-duplicate-in-an-array/',
      }
    ]
  },
  {
    id: 'two-pointers',
    title: 'Two Pointers',
    problems: [
      {
        id: 'valid-palindrome',
        title: 'Valid Palindrome',
        difficulty: 'Easy',
        youtubeUrl: 'https://www.youtube.com/results?search_query=valid+palindrome+dsa',
        practiceUrl: 'https://leetcode.com/problems/valid-palindrome/',
        articleUrl: 'https://takeuforward.org/data-structure/check-if-a-string-is-palindrome-or-not/',
      },
      {
        id: '3sum',
        title: '3Sum',
        difficulty: 'Medium',
        youtubeUrl: 'https://www.youtube.com/results?search_query=3sum+dsa',
        practiceUrl: 'https://leetcode.com/problems/3sum/',
        articleUrl: 'https://takeuforward.org/data-structure/3-sum-find-triplets-that-add-up-to-zero/',
      }
    ]
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window',
    problems: [
      {
        id: 'best-time-to-buy-sell',
        title: 'Best Time to Buy and Sell Stock',
        difficulty: 'Easy',
        youtubeUrl: 'https://www.youtube.com/results?search_query=best+time+to+buy+sell+stock+dsa',
        practiceUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
        articleUrl: 'https://takeuforward.org/data-structure/stock-buy-and-sell/',
      }
    ]
  },
  {
    id: 'stacks',
    title: 'Stacks',
    problems: [
      {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        youtubeUrl: 'https://www.youtube.com/results?search_query=valid+parentheses+dsa',
        practiceUrl: 'https://leetcode.com/problems/valid-parentheses/',
        articleUrl: 'https://takeuforward.org/data-structure/check-for-balanced-parentheses/',
      }
    ]
  },
  {
    id: 'trees',
    title: 'Trees',
    problems: [
      {
        id: 'invert-binary-tree',
        title: 'Invert Binary Tree',
        difficulty: 'Easy',
        youtubeUrl: 'https://www.youtube.com/results?search_query=invert+binary+tree+dsa',
        practiceUrl: 'https://leetcode.com/problems/invert-binary-tree/',
        articleUrl: 'https://takeuforward.org/data-structure/invert-a-binary-tree/',
      },
      {
        id: 'maximum-depth',
        title: 'Maximum Depth of Binary Tree',
        difficulty: 'Easy',
        youtubeUrl: 'https://www.youtube.com/results?search_query=max+depth+binary+tree+dsa',
        practiceUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
        articleUrl: 'https://takeuforward.org/data-structure/maximum-depth-of-a-binary-tree/',
      }
    ]
  },
  {
    id: 'graphs',
    title: 'Graphs',
    problems: [
      {
        id: 'number-of-islands',
        title: 'Number of Islands',
        difficulty: 'Medium',
        youtubeUrl: 'https://www.youtube.com/results?search_query=number+of+islands+dsa',
        practiceUrl: 'https://leetcode.com/problems/number-of-islands/',
        articleUrl: 'https://takeuforward.org/data-structure/number-of-islands/',
      },
      {
        id: 'clone-graph',
        title: 'Clone Graph',
        difficulty: 'Medium',
        youtubeUrl: 'https://www.youtube.com/results?search_query=clone+graph+dsa',
        practiceUrl: 'https://leetcode.com/problems/clone-graph/',
        articleUrl: 'https://takeuforward.org/data-structure/clone-a-graph/',
      }
    ]
  },
  {
    id: 'dp',
    title: 'Dynamic Programming',
    problems: [
      {
        id: 'climbing-stairs',
        title: 'Climbing Stairs',
        difficulty: 'Easy',
        youtubeUrl: 'https://www.youtube.com/results?search_query=climbing+stairs+dsa',
        practiceUrl: 'https://leetcode.com/problems/climbing-stairs/',
        articleUrl: 'https://takeuforward.org/data-structure/climbing-stairs/',
      },
      {
        id: 'house-robber',
        title: 'House Robber',
        difficulty: 'Medium',
        youtubeUrl: 'https://www.youtube.com/results?search_query=house+robber+dsa',
        practiceUrl: 'https://leetcode.com/problems/house-robber/',
        articleUrl: 'https://takeuforward.org/data-structure/house-robber/',
      }
    ]
  }
];
