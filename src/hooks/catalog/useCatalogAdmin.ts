import { useState, useEffect } from 'react';
import { CategoriesService, CoursesService, ChaptersService, LessonsService, ModerationLogsService } from '../../services/db';
import { auth } from '../../firebase';
import { Category, Course, Chapter, Lesson } from '../../types/models';
import { orderBy, where } from 'firebase/firestore';

export function useCategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = CategoriesService.subscribe([orderBy('order', 'asc')], (data) => {
      setCategories(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const addCategory = async (data: Partial<Category>) => {
    return CategoriesService.create({ ...data, order: categories.length, status: 'active' } as any);
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    return CategoriesService.update(id, data);
  };

  const deleteCategory = async (id: string) => {
    return CategoriesService.update(id, { status: 'archived' });
  };

  return { categories, loading, addCategory, updateCategory, deleteCategory };
}

export function useCoursesAdmin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = CoursesService.subscribe([orderBy('createdAt', 'desc')], (data) => {
      setCourses(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const addCourse = async (data: Partial<Course>) => {
    const newId = await CoursesService.create({ 
      ...data, 
      status: 'draft',
      totalLessons: 0,
      totalDuration: 0,
      rating: 0,
      reviewCount: 0
    } as any);
    return { id: newId };
  };

  const updateCourse = async (id: string, data: Partial<Course>) => {
    return CoursesService.update(id, data);
  };

  const deleteCourse = async (id: string) => {
    return CoursesService.update(id, { status: 'archived' });
  };

  return { courses, loading, addCourse, updateCourse, deleteCourse };
}

export function useCourseBuilder(courseId: string) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const unsubChapters = ChaptersService.subscribe([where('courseId', '==', courseId), orderBy('order', 'asc')], (data) => {
      setChapters(data);
    });

    const unsubLessons = LessonsService.subscribe([where('courseId', '==', courseId), orderBy('order', 'asc')], (data) => {
      setLessons(data);
      setLoading(false);
    });

    return () => {
      unsubChapters();
      unsubLessons();
    };
  }, [courseId]);

  const addChapter = async (title: string, description?: string) => {
    return ChaptersService.create({
      courseId,
      title,
      description,
      order: chapters.length,
      status: 'draft'
    } as any);
  };

  const addLesson = async (chapterId: string, title: string, type: Lesson['type']) => {
    const chapterLessons = lessons.filter(l => l.chapterId === chapterId);
    return LessonsService.create({
      courseId,
      chapterId,
      title,
      type,
      order: chapterLessons.length,
      duration: 0,
      isFreePreview: false,
      status: 'draft'
    } as any);
  };

  const updateChapter = async (id: string, data: Partial<Chapter>) => ChaptersService.update(id, data);
  const updateLesson = async (id: string, data: Partial<Lesson>) => LessonsService.update(id, data);

  const deleteChapter = async (id: string) => {
    await ChaptersService.update(id, { status: 'archived' });
    if (auth.currentUser) {
      await ModerationLogsService.create({ entityId: id, entityType: 'chapter', action: 'CHAPTER_DELETED', actorId: auth.currentUser.uid, timestamp: Date.now() });
    }
  };
  const deleteLesson = async (id: string) => {
    await LessonsService.update(id, { status: 'archived' });
    if (auth.currentUser) {
      await ModerationLogsService.create({ entityId: id, entityType: 'lesson', action: 'LESSON_DELETED', actorId: auth.currentUser.uid, timestamp: Date.now() });
    }
  };

  return { 
    chapters, lessons, loading, 
    addChapter, updateChapter, deleteChapter,
    addLesson, updateLesson, deleteLesson 
  };
}
