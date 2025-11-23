export interface Profile {
  id: string;
  full_name: string;
  role: 'student' | 'teacher';
  updated_at: string;
}

export interface Material {
  id: string;
  subject_name: string;
  description: string;
  file_url: string;
  teacher_id: string;
  created_at: string;
  profiles: { // For joining teacher's name
    full_name: string;
  } | null;
}

export interface StudentCode {
    id: string;
    code: string;
    is_used: boolean;
}
