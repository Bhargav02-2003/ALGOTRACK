import { connectDB } from './database.js';
import Chapter from '../models/Chapter.js';
import Problem from '../models/Problem.js';
import { v4 as uuidv4 } from 'uuid';

export async function initDatabase() {
  await connectDB();
  console.log('🎉 MongoDB ready!');
}

export async function seedDatabase() {
  try {
    const chapterCount = await Chapter.countDocuments();
    if (chapterCount > 0) {
      console.log('ℹ️  Database already seeded, skipping...');
      return;
    }

    console.log('🌱 Seeding database...');

    // Chapters Data
    const chapters = [
      { id: uuidv4(), slug: 'arrays-and-hashing', title: 'Arrays & Hashing', sort_order: 1 },
      { id: uuidv4(), slug: 'two-pointers', title: 'Two Pointers', sort_order: 2 },
      { id: uuidv4(), slug: 'sliding-window', title: 'Sliding Window', sort_order: 3 },
    ];

    await Chapter.insertMany(chapters);

    // Problems Data
    const problems = [
      {
        id: uuidv4(),
        chapter_id: chapters[0].id,
        slug: 'contains-duplicate',
        title: 'Contains Duplicate',
        difficulty: 'Easy',
        youtube_url: 'https://youtube.com/watch?v=3OamzN90kPg',
        practice_url: 'https://leetcode.com/problems/contains-duplicate/',
        article_url: 'https://neetcode.io/articles/contains-duplicate',
        sort_order: 1,
      },
      {
        id: uuidv4(),
        chapter_id: chapters[0].id,
        slug: 'valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'Easy',
        youtube_url: 'https://youtube.com/watch?v=9UtInBqnCgA',
        practice_url: 'https://leetcode.com/problems/valid-anagram/',
        article_url: 'https://neetcode.io/articles/valid-anagram',
        sort_order: 2,
      },
      {
        id: uuidv4(),
        chapter_id: chapters[0].id,
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        youtube_url: 'https://youtube.com/watch?v=KLlXCFG5TnA',
        practice_url: 'https://leetcode.com/problems/two-sum/',
        article_url: 'https://neetcode.io/articles/two-sum',
        sort_order: 3,
      },
      {
        id: uuidv4(),
        chapter_id: chapters[1].id,
        slug: 'valid-palindrome',
        title: 'Valid Palindrome',
        difficulty: 'Easy',
        youtube_url: 'https://youtube.com/watch?v=jJXJ16kPFWg',
        practice_url: 'https://leetcode.com/problems/valid-palindrome/',
        article_url: 'https://neetcode.io/articles/valid-palindrome',
        sort_order: 1,
      },
      {
        id: uuidv4(),
        chapter_id: chapters[1].id,
        slug: '3sum',
        title: '3Sum',
        difficulty: 'Medium',
        youtube_url: 'https://youtube.com/watch?v=jzZsG8n2R9A',
        practice_url: 'https://leetcode.com/problems/3sum/',
        article_url: 'https://neetcode.io/articles/3sum',
        sort_order: 2,
      },
      {
        id: uuidv4(),
        chapter_id: chapters[2].id,
        slug: 'best-time-to-buy-and-sell-stock',
        title: 'Best Time to Buy and Sell Stock',
        difficulty: 'Easy',
        youtube_url: 'https://youtube.com/watch?v=1pkOgXD63yU',
        practice_url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
        article_url: 'https://neetcode.io/articles/best-time-to-buy-and-sell-stock',
        sort_order: 1,
      },
    ];

    await Problem.insertMany(problems);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}
