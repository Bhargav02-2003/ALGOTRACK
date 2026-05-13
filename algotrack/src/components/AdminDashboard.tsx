import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, BookOpen, Edit2, X, Save, Loader2, CheckCircle2, Plus } from 'lucide-react';
import {
  getAdminStudentsAPI,
  updateAdminProblemAPI,
  createAdminProblemAPI,
  createAdminChapterAPI,
  getChaptersAPI,
  type AdminStudent,
  type Chapter,
  type Problem,
} from '../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'Students' | 'Topics'>('Students');
  
    // Students State
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Topics State
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [creatingForChapter, setCreatingForChapter] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Problem>>({});
  const [savingProblem, setSavingProblem] = useState(false);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [savingChapter, setSavingChapter] = useState(false);

  useEffect(() => {
    if (activeTab === 'Students') {
      fetchStudents();
    } else {
      fetchTopics();
    }
  }, [activeTab]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    const res = await getAdminStudentsAPI();
    if (res.success && res.data) {
      setStudents(res.data);
    }
    setLoadingStudents(false);
  };

  const handleStudentClick = async (student: AdminStudent) => {
    setSelectedStudent(student);
    setLoadingProgress(true);
    const { getAdminStudentProgressAPI } = await import('../services/api');
    const res = await getAdminStudentProgressAPI(student.id);
    if (res.success && res.data) {
      setStudentProgress(res.data);
    }
    setLoadingProgress(false);
  };

  const fetchTopics = async () => {
    setLoadingTopics(true);
    const res = await getChaptersAPI();
    if (res.success && res.data) {
      setChapters(res.data);
    }
    setLoadingTopics(false);
  };

  const handleCreateClick = (chapterId: string) => {
    setCreatingForChapter(chapterId);
    setEditingProblem(null);
    setEditForm({
      title: '',
      difficulty: 'Easy',
      youtube_url: '',
      practice_url: '',
      article_url: '',
    });
  };

  const handleEditClick = (problem: Problem) => {
    setEditingProblem(problem);
    setCreatingForChapter(null);
    setEditForm({
      title: problem.title,
      difficulty: problem.difficulty,
      youtube_url: problem.youtube_url,
      practice_url: problem.practice_url,
      article_url: problem.article_url,
    });
  };

  const handleSaveProblem = async () => {
    if (!editingProblem && !creatingForChapter) return;
    setSavingProblem(true);
    
    let res;
    if (creatingForChapter) {
      res = await createAdminProblemAPI({ ...editForm, chapter_id: creatingForChapter });
    } else if (editingProblem) {
      res = await updateAdminProblemAPI(editingProblem.id, editForm);
    }

    if (res?.success) {
      await fetchTopics();
      setEditingProblem(null);
      setCreatingForChapter(null);
    } else {
      alert('Failed to save problem');
    }
    setSavingProblem(false);
  };

  const handleSaveChapter = async () => {
    if (!chapterTitle.trim()) return;
    setSavingChapter(true);
    const res = await createAdminChapterAPI({ title: chapterTitle, sort_order: chapters.length });
    if (res.success) {
      await fetchTopics();
      setIsCreatingChapter(false);
      setChapterTitle('');
    } else {
      alert('Failed to create chapter');
    }
    setSavingChapter(false);
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={() => { setActiveTab('Students'); setSelectedStudent(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
            activeTab === 'Students' ? 'bg-[#1E70EB] text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Users className="w-5 h-5" />
          Student Progress
        </button>
        <button
          onClick={() => setActiveTab('Topics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
            activeTab === 'Topics' ? 'bg-[#1E70EB] text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Manage Topics
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Students Tab */}
        {activeTab === 'Students' && !selectedStudent && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-black text-slate-900">Student Progress Overview</h2>
            {loadingStudents ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 text-[#1E70EB] animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4">
                {students.map((student) => {
                  const pct = student.total_problems > 0 
                    ? Math.round((student.completed_count / student.total_problems) * 100) 
                    : 0;
                  
                  return (
                    <div 
                      key={student.id} 
                      onClick={() => handleStudentClick(student)}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-[#1E70EB] transition-colors"
                    >
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{student.display_name || 'Anonymous User'}</h3>
                        <p className="text-sm text-slate-500">{student.email}</p>
                        <p className="text-xs text-slate-400 mt-1">Joined: {new Date(student.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="w-64 text-right">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                          <span>Progress</span>
                          <span>{student.completed_count} / {student.total_problems} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <p className="text-slate-500 text-center py-8">No students found.</p>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Selected Student Details */}
        {activeTab === 'Students' && selectedStudent && (
          <motion.div
            key="student-details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-[#1E70EB] transition-colors"
              >
                ← Back to Students
              </button>
              <h2 className="text-2xl font-black text-slate-900">
                {selectedStudent.display_name || selectedStudent.email}'s Details
              </h2>
            </div>
            
            <div className="bg-[#1E70EB] text-white p-6 rounded-2xl flex gap-12">
               <div>
                  <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">Completed</p>
                  <p className="text-4xl font-black mt-1">{selectedStudent.completed_count}</p>
               </div>
               <div>
                  <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">Remaining</p>
                  <p className="text-4xl font-black mt-1">{selectedStudent.total_problems - selectedStudent.completed_count}</p>
               </div>
               <div>
                  <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">Mastery</p>
                  <p className="text-4xl font-black mt-1">
                    {selectedStudent.total_problems > 0 ? Math.round((selectedStudent.completed_count / selectedStudent.total_problems) * 100) : 0}%
                  </p>
               </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Completed Topics Log</h3>
              </div>
              {loadingProgress ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 text-[#1E70EB] animate-spin" /></div>
              ) : studentProgress.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No topics completed yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {studentProgress.map((prog) => (
                    <div key={prog.id} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <h4 className="font-bold text-slate-700">{prog.problem_title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                            {prog.difficulty}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-1 ml-8">{prog.chapter_title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 font-medium">Completed on</p>
                        <p className="text-sm font-bold text-slate-700">
                          {new Date(prog.completed_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Topics Tab */}
        {activeTab === 'Topics' && (
          <motion.div
            key="topics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Manage Topics & Links</h2>
              <button
                onClick={() => setIsCreatingChapter(true)}
                className="flex items-center gap-2 bg-[#1E70EB] hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-bold transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Chapter
              </button>
            </div>
            {loadingTopics ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 text-[#1E70EB] animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-black text-lg text-slate-800">{chapter.title}</h3>
                      <button
                        onClick={() => handleCreateClick(chapter.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#1E70EB] hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create Topic
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {chapter.problems?.map((problem) => (
                        <div key={problem.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-slate-700">{problem.title}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                                ${problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' : ''}
                                ${problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : ''}
                                ${problem.difficulty === 'Hard' ? 'bg-rose-100 text-rose-700' : ''}
                              `}>
                                {problem.difficulty}
                              </span>
                            </div>
                            <div className="flex gap-4 mt-2 text-xs text-slate-500">
                              {problem.practice_url && <a href={problem.practice_url} target="_blank" className="hover:text-[#1E70EB] truncate max-w-[200px]">Practice Link</a>}
                              {problem.youtube_url && <a href={problem.youtube_url} target="_blank" className="hover:text-red-500 truncate max-w-[200px]">YouTube Link</a>}
                              {problem.article_url && <a href={problem.article_url} target="_blank" className="hover:text-[#1E70EB] truncate max-w-[200px]">Article Link</a>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditClick(problem)}
                            className="p-2 text-slate-400 hover:text-[#1E70EB] hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit/Create Problem Modal */}
      {(editingProblem || creatingForChapter) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative"
          >
            <button
              onClick={() => { setEditingProblem(null); setCreatingForChapter(null); }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-black mb-6 text-slate-900">
              {creatingForChapter ? 'Create New Topic' : 'Edit Topic'}
            </h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-500">Title</span>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E70EB] outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-500">Difficulty</span>
                <select
                  value={editForm.difficulty || 'Easy'}
                  onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value as any })}
                  className="mt-1 block w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E70EB] outline-none bg-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-500">Practice URL</span>
                <input
                  type="text"
                  value={editForm.practice_url || ''}
                  onChange={(e) => setEditForm({ ...editForm, practice_url: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E70EB] outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-500">YouTube URL</span>
                <input
                  type="text"
                  value={editForm.youtube_url || ''}
                  onChange={(e) => setEditForm({ ...editForm, youtube_url: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E70EB] outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-500">Article URL</span>
                <input
                  type="text"
                  value={editForm.article_url || ''}
                  onChange={(e) => setEditForm({ ...editForm, article_url: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E70EB] outline-none"
                />
              </label>
              <button
                onClick={handleSaveProblem}
                disabled={savingProblem}
                className="w-full flex justify-center items-center gap-2 mt-4 bg-[#1E70EB] text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {savingProblem ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Chapter Modal */}
      {isCreatingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative"
          >
            <button
              onClick={() => setIsCreatingChapter(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-black mb-6 text-slate-900">New Chapter</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-500">Chapter Title</span>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="e.g. Dynamic Programming"
                  className="mt-1 block w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E70EB] outline-none"
                  autoFocus
                />
              </label>
              <button
                onClick={handleSaveChapter}
                disabled={savingChapter || !chapterTitle.trim()}
                className="w-full flex justify-center items-center gap-2 mt-4 bg-[#1E70EB] text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {savingChapter ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Create Chapter
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
