export interface Profile {
  id: string;
  full_name: string;
  role: 'student' | 'teacher';
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface Material {
  id: string;
  course_id: string;
  title:string;
  file_url: string;
  created_at: string;
}
